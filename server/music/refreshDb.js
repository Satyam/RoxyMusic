import fs from 'fs';
import denodeify from 'denodeify';
import path from 'path';
import { choke, releaseChoke } from '_server/utils/choke';
import { getConfig } from '_server/config';
import omit from 'lodash/omit';

import mp3Duration from 'mp3-duration';
import mm from 'musicmetadata';

const readDir = denodeify(fs.readdir);
const getDuration = denodeify(mp3Duration);
const mediaData = denodeify(mm);

const stat = denodeify(fs.stat);

let audioExtensions = [];
let initialDir = '';
let prepared = {};

export default function init() {
  initialDir = getConfig('musicDir');
  audioExtensions = getConfig('audioExtensions').split(',').map(e => e.trim());
  return db.prepareAll({
    fetchByLocation: 'select * from AllTracks where location = $location',
    selectGenreId: 'select idGenre from Genres where genre = $genre',
    insertGenre: 'insert into Genres (genre) values ($genre)',
    selectPersonId: 'select idPerson from People where artist = $artist',
    insertPerson: 'insert into People (artist) values ($artist)',
    selectAlbumId: 'select idAlbum from Albums where album = $album',
    insertAlbum: 'insert into Albums (album) values ($album)',
    hasAlbumArtistMap: 'select count(*) as `count` from AlbumArtistMap where idAlbum = $idAlbum and idArtist = $idArtist',
    insertAlbumArtistMap: 'insert into AlbumArtistMap (idAlbum, idArtist) values ($idAlbum, $idArtist)',
    /*
    `idTrack` INTEGER PRIMARY KEY AUTOINCREMENT,
    `title` TEXT,
    `idArtist` INTEGER,
    `idAlbumArtist` INTEGER,
    `idAlbum` INTEGER,
    `track` INTEGER,
    `year` INTEGER,
    `duration` INTEGER,
    `idGenre` INTEGER,
    `location` TEXT,
    `fileModified` TEXT,
    `size` INTEGER,
    `hasIssues` INTEGER,
    */
    insertTrack: `
      insert into Tracks(
        "title",
        "idArtist",
        "idAlbumArtist",
        "idAlbum",
        "track",
        "year",
        "duration",
        "idGenre",
        "location",
        "fileModified",
        "size",
        "hasIssues"
      ) values (
        $title,
        $idArtist,
        $idAlbumArtist,
        $idAlbum,
        $track,
        $year,
        $duration,
        $idGenre,
        $location,
        $fileModified,
        $size,
        $hasIssues
      )
    `,
  })
  .then((p) => {
    prepared = p;
  });
}


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
  .then(id => releaseChoke(resId, id))
  .catch(err => console.trace('getPersonId', err));
}

export function insertTrack(tags) {
  const t = omit(tags, [
    'artist',
    'album_artist',
    'genre',
    'album',
  ]);
  return Promise.resolve()
  .then(() => {
    const artist = tags.artist;
    if (artist) {
      return getPersonId(artist)
      .then((id) => {
        t.idArtist = id;
      });
    }
    return null;
  })
  .then(() => {
    if (tags.album_artist) {
      return getPersonId(tags.album_artist)
      .then((id) => {
        t.idAlbumArtist = id;
      });
    }
    return null;
  })
  .then(() => {
    if (tags.genre) {
      const m = genreRxp.exec(tags.genre);
      if (m) {
        return (t.idGenre = parseInt(m[1], 10));
      }
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
    const album = tags.album;
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
      const aaMap = {
        $idAlbum: t.idAlbum,
        $idArtist: t.idAlbumArtist,
      };
      return prepared.hasAlbumArtistMap.get(aaMap)
      .then(row => (
        row.count
        ? null
        : prepared.insertAlbumArtistMap.run(aaMap)
      ));
    }
    return null;
  })
  .then(() => prepared.insertTrack.run(db.dolarizeQueryParams(t)))
  .then(res => res.lastID)
  .catch(err => console.trace('insertTrack', err));
}

function readTags(fileName) {
  // https://github.com/ddsol/mp3-duration
  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/duration
  const readableStream = fs.createReadStream(fileName);
  return mediaData(readableStream, { duration: true })
    .catch(() => ({
      hasIssues: true,
      artist: [],
      albumartist: [],
      genre: [],
    }))
    .then((tags) => {
      readableStream.close();
      const t = {
        artist: tags.artist.join(', '),
        album_artist: tags.albumartist.join(', '),
        genre: tags.genre.join(', '),
        album: tags.album,
        title: tags.title,
      };
      const loc = path.basename(fileName, path.extname(fileName)).split('-').map(s => s.trim());
      if (!t.title) {
        t.hasIssues = 1;
        t.title = loc[loc.length - 1];
      }
      if (!t.artist) {
        t.hasIssues = 1;
        t.artist = loc.length === 3 ? loc[1] : loc[0];
      }
      if (!t.album && loc.length === 3) {
        t.hasIssues = 1;
        t.album = loc[0];
      }

      if (tags.year) t.year = parseInt(tags.year, 10);
      if (t.year <= 0) t.year = null;
      if (tags.track && tags.track.no) t.track = parseInt(tags.track.no, 10);
      if (t.track <= 0) t.track = null;
      if (tags.duration) t.duration = Math.round(tags.duration);
      if (t.duration <= 0) t.duration = null;
      return (
        t.duration
        ? t
        : getDuration(fileName)
        .then(duration => Object.assign(t, { duration: Math.round(duration) }))
        .catch((err) => {
          console.trace('getDuration', err);
          return t;
        })
      );
    })
    .catch(err => console.trace('readTags', fileName, err));
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
                  fileModified: st.mtime.toISOString(),
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
    console.trace('scan', err);
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
