import fs from 'fs';
import denodeify from 'denodeify';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import pick from 'lodash/pick';
import { dolarizeQueryParams, prepareAll } from '_server/utils';

const readDir = denodeify(fs.readdir);
const stat = denodeify(fs.stat);

let audioExtensions = [];
let initialDir = '';
let prepared = {};

export default function init(config) {
  initialDir = config.musicDir;
  audioExtensions = config.audioExtensions.split(',').map(e => e.trim());
  return prepareAll({
    fetchByLocation: 'select * from AllTracks where location = $location',
    selectGenreId: 'select idGenre from Genres where genre = $genre',
    insertGenre: 'insert into Genres (genre) values ($genre)',
    selectPersonId: 'select idPerson from People where artist = $artist',
    insertPerson: 'insert into People (artist) values ($artist)',
    selectAlbumId: 'select idAlbum from Albums where album = $album',
    insertAlbum: 'insert into Albums (album) values ($album)',
    insertTrack: `
      insert into Tracks(
        title, idArtist, idComposer, idAlbumArtist, idAlbum, track, date, idGenre, location, fileModified, hasIssues
      ) values (
        $title, $idArtist, $idComposer, $idAlbumArtist, $idAlbum, $track, $date, $idGenre, $location, $fileModified, $hasIssues
      )
    `,
  })
  .then((p) => {
    prepared = p;
  });
}

const useTags = [
  'album',
  'title',
  'track',
  'artist',
  'album',
  'album_artist',
  'composer',
  'date',
  'genre',
];

export function insertTrack(tags) {
  const t = pick(tags, [
    'title',
    'track',
    'location',
    'track',
  ]);
  const loc = path.basename(t.location, path.extname(t.location)).split('-').map(s => s.trim());
  if (!t.title) {
    t.hasIssues = 1;
    t.title = loc[loc.length - 1];
  }
  t.fileModified = tags.fileModified.toISOString();
  return Promise.resolve()
  .then(() => {
    let artist = tags.artist;
    if (!artist) {
      t.hasIssues = 1;
      artist = loc.length === 3 ? loc[1] : loc[0];
    }
    if (artist) {
      const who = { $artist: artist };
      return prepared.selectPersonId.get(who)
      .then(row => (
        row
        ? row.idPerson
        : prepared.insertPerson.run(who)
        .then(res => res.lastID)
      ))
      .then((id) => {
        t.idArtist = id;
      });
    }
    return null;
  })
  .then(() => {
    if ('album_artist' in tags) {
      const who = { $artist: tags.artist };
      return prepared.selectPersonId.get(who)
      .then(row => (
        row
        ? row.idPerson
        : prepared.insertPerson.run(who)
        .then(res => res.lastID)
      ))
      .then((id) => {
        t.idAlbumArtist = id;
      });
    }
    return null;
  })
  .then(() => {
    if ('composer' in tags) {
      const who = { $artist: tags.artist };
      prepared.selectPersonId.get(who)
      .then(row => (
        row
        ? row.idPerson
        : prepared.insertPerson.run(who)
        .then(res => res.lastID)
      ))
      .then((id) => {
        t.idComposer = id;
      });
    }
    return null;
  })
  .then(() => {
    if ('genre' in tags) {
      const which = { $genre: tags.genre };
      return prepared.selectGenreId.get(which)
      .then(row => (
        row
        ? row.idGenre
        : prepared.insertGenre.run(which)
        .then(res => res.lastID)
      ))
      .then((id) => {
        t.idGenre = id;
      });
    }
    return null;
  })
  .then(() => {
    let album = tags.album;
    if (!album && loc.length === 3) {
      t.hasIssues = 1;
      album = loc[0];
    }
    if (album) {
      const which = { $album: album };
      return prepared.selectAlbumId.get(which)
      .then(row => (
        row
        ? row.idAlbum
        : prepared.insertAlbum.run(which)
        .then(res => res.lastID)
      ))
      .then((id) => {
        t.idAlbum = id;
      });
    }
    return null;
  })
  .then(() => prepared.insertTrack.run(dolarizeQueryParams(t)))
  .then(res => res.lastID);
}

function readTags(fileName) {
  return new Promise((resolve, reject) => {
    ffmpeg(fileName)
    .ffprobe((err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(pick(data.format && data.format.tags, useTags));
      }
    });
  });
}

const pending = [];
let stopRequested = false;
const errors = [];

export function scan(dir) {
  return readDir(dir)
  .then(files => Promise.all(files.map((file) => {
    const fullName = path.join(dir, file);
    const relName = path.relative(initialDir, fullName);
    return stat(fullName)
    .then((st) => {
      if (st.isDirectory()) return pending.push(fullName);
      if (st.isFile()) {
        const ext = path.extname(file).substr(1);
        if (audioExtensions.indexOf(ext) !== -1) {
          return prepared.fetchByLocation.all({
            $location: relName,
          })
          .then((rows) => {
            if (rows.length) {
              if (rows.length > 1) {
                return Promise.reject(`refreshDb: Multiple entries for ${file}, idTracks: ${rows.map(row => row.idTrack).join(',')}`);
              }
              // console.log('found', relName);
            } else {
              return readTags(fullName)
              .then(t => insertTrack(
                Object.assign(t, {
                  location: relName,
                  fileModified: st.mtime,
                })
              ));
            }
            return null;
          });
        }
      }
      return null;
    });
  })))
  .then(() => {
    if (stopRequested) {
      pending.length = 0;
      stopRequested = false;
    } else if (pending.length) {
      // console.log('next batch', pending.length);
      setImmediate(scan, pending.shift());
    }
  })
  .catch(err => errors.push(err));
}

export function refreshStatus() {
  if (pending.length) {
    if (stopRequested) {
      return {
        status: 'stop pending',
        pending: pending.length,
        errors,
      };
    }
    return {
      status: 'working',
      pending: pending.length,
      errors,
    };
  }
  return {
    status: 'stopped',
    pending: pending.length,
    errors,
  };
}

export function startRefresh() {
  // stopRequested = false;
  stopRequested = true;
  setImmediate(scan, initialDir);
  return refreshStatus;
}


export function stopRefresh() {
  stopRequested = true;
  return refreshStatus();
}
