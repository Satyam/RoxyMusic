import fs from 'fs';
import denodeify from 'denodeify';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import pick from 'lodash/pick';
import { dolarizeQueryParams, prepareAll, choke, releaseChoke } from '_server/utils';
import { getConfig } from '_server/config';

import ID3 from 'id3-parser';
import union from 'lodash/union';

const readDir = denodeify(fs.readdir);
const readFile = denodeify(fs.readFile);

const stat = denodeify(fs.stat);

let audioExtensions = [];
let initialDir = '';
let prepared = {};

export default function init() {
  initialDir = getConfig('musicDir');
  audioExtensions = getConfig('audioExtensions').split(',').map(e => e.trim());
  return prepareAll({
    fetchByLocation: 'select * from AllTracks where location = $location',
    selectGenreId: 'select idGenre from Genres where genre = $genre',
    insertGenre: 'insert into Genres (genre) values ($genre)',
    selectPersonId: 'select idPerson from People where artist = $artist',
    insertPerson: 'insert into People (artist) values ($artist)',
    selectAlbumId: 'select idAlbum from Albums where album = $album',
    insertAlbum: 'insert into Albums (album) values ($album)',
    hasAlbumArtistMap: 'select count(*) as `count` from AlbumArtistMap where idAlbum = $idAlbum and idArtist = $idArtist',
    insertAlbumArtistMap: 'insert into AlbumArtistMap (idAlbum, idArtist) values ($idAlbum, $idArtist)',
    insertTrack: `
      insert into Tracks(
        title, idArtist, idComposer, idAlbumArtist, idAlbum, track, date, length, idGenre, location, fileModified, size, hasIssues
      ) values (
        $title, $idArtist, $idComposer, $idAlbumArtist, $idAlbum, $track, $date, $length, $idGenre, $location, $fileModified, $size, $hasIssues
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
  'TLEN',
];

const genreRxp = /\((\d+)\)/;

export function getPersonId(name) {
  const who = { $artist: name.trim() };
  const resId = `artist:${name}`;
  return choke(resId)
  .then(() => prepared.selectPersonId.get(who))
  .then(row => (
    row
    ? row.idPerson
    : prepared.insertPerson.run(who)
    .then(res => res.lastID)
  ))
  .then(id => releaseChoke(resId, id));
}

export function insertTrack(tags) {
  const t = pick(tags, [
    'title',
    'location',
    'size',
    'date',
  ]);
  const loc = path.basename(t.location, path.extname(t.location)).split('-').map(s => s.trim());
  if (!t.title) {
    t.hasIssues = 1;
    t.title = loc[loc.length - 1];
  }
  if (tags.track) t.track = parseInt(tags.track, 10);
  if (t.track <= 0) t.track = null;
  if (t.date <= 0) t.date = null;
  if (tags.TLEN) t.length = parseInt(tags.TLEN, 10);
  if (t.length <= 0) t.length = null;
  t.fileModified = tags.fileModified.toISOString();
  return Promise.resolve()
  .then(() => {
    let artist = tags.artist;
    if (!artist) {
      t.hasIssues = 1;
      artist = loc.length === 3 ? loc[1] : loc[0];
    }
    if (artist) {
      return getPersonId(artist)
      .then((id) => {
        t.idArtist = id;
      });
    }
    return null;
  })
  .then(() => {
    if ('album_artist' in tags) {
      return getPersonId(tags.album_artist)
      .then((id) => {
        t.idAlbumArtist = id;
      });
    }
    return null;
  })
  .then(() => {
    if ('composer' in tags) {
      return getPersonId(tags.composer)
      .then((id) => {
        t.idComposer = id;
      });
    }
    return null;
  })
  .then(() => {
    if ('genre' in tags) {
      const m = genreRxp.exec(tags.genre);
      if (m) return parseInt(m[1], 10);
      const which = { $genre: tags.genre };
      const resId = `genre:${tags.genre}`;
      return choke(resId)
      .then(() => prepared.selectGenreId.get(which))
      .then(row => (
        row
        ? row.idGenre
        : prepared.insertGenre.run(which)
        .then(res => res.lastID)
      ))
      .then((id) => {
        t.idGenre = id;
      })
      .then(() => releaseChoke(resId));
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
      const resId = `album:${album}`;
      return choke(resId)
      .then(() => prepared.selectAlbumId.get(which))
      .then(row => (
        row
        ? row.idAlbum
        : prepared.insertAlbum.run(which)
        .then(res => res.lastID)
      ))
      .then((id) => {
        t.idAlbum = id;
      })
      .then(() => releaseChoke(resId));
    }
    return null;
  })
  .then(() => {
    if (t.idAlbumArtist && t.idAlbum) {
      const map = {
        $idAlbum: t.idAlbum,
        $idArtist: t.idAlbumArtist,
      };
      return prepared.hasAlbumArtistMap.get(map)
      .then(row => (
        row.count
        ? null
        : prepared.insertAlbumArtistMap.run(map)
      ));
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
        const ts = data.format.tags;
        readFile(fileName)
        .then(fileBuffer => ID3.parse(fileBuffer))
        .then((tags) => {
          // /* eslint-disable */
          // tags.date = tags.year;
          // delete tags.year;
          // tags.album_artist = tags.band;
          // delete tags.band;
          // tags.length = tags.TLEN;
          // delete tags.TLEN;
          // delete tags.version;
          // /* eslint-enable */
          // console.log('-------------\n', fileName);
          // if (data.format && typeof data.format.tags !== 'object') {
          //   console.log('********** data format with no tags', data.format);
          // }
          // const mixed = union(
          //   Object.keys(ts),
          //   Object.keys(tags)
          // );
          // mixed.forEach((tag) => {
          //   const tagFF = ts[tag];
          //   const tagID3 = tags[tag];
          //   if ((tagFF || tagID3) && tagFF !== tagID3) {
          //     console.log(tag);
          //     console.log('    ', tagFF);
          //     console.log('    ', tagID3);
          //   }
          // });
          resolve(pick(ts, useTags));
        });
      }
    });
  });
}

const pending = [];
let stopRequested = false;
const errors = [];
let steps = 100;

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
            } else {
              return readTags(fullName)
              .then(t => insertTrack(
                Object.assign(t, {
                  location: relName,
                  fileModified: st.mtime,
                  size: st.size,
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
    steps -= 1;
    if (stopRequested || steps < 0) {
      pending.length = 0;
      stopRequested = false;
      db.exec('vacuum');
    } else if (pending.length) {
      setImmediate(scan, pending.shift());
    }
  })
  .catch((err) => {
    console.error(err);
    errors.push(err);
    pending.length = 0;
    stopRequested = false;
  });
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
  stopRequested = false;
  setImmediate(scan, initialDir);
  return refreshStatus;
}


export function stopRefresh() {
  stopRequested = true;
  return refreshStatus();
}
