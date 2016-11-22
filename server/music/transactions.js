import { join } from 'path';
import denodeify from 'denodeify';
import fs from 'fs';

import { getConfig as getCfg, setConfig as setCfg } from '_server/config';
import initRefresh, { startRefresh, refreshStatus, stopRefresh } from './refreshDb';

const absPath = relPath => join(ROOT_DIR, relPath);
const writeFile = denodeify(fs.writeFile);

let prepared = {};

export function init() {
  return db.prepareAll({
    getAlbums: 'select * from AllAlbums limit $count offset $offset',
    searchAlbums: 'select * from AllAlbums where album like $search limit $count offset $offset',
    getAlbum: 'select * from AllAlbums where idAlbum = $idAlbum',

    getArtists: 'select * from AllArtists limit $count offset $offset',
    searchArtists: 'select * from AllArtists where artist like $search limit $count offset $offset',
    getArtist: 'select * from AllArtists where idArtist = $idArtist',

    getSongs: 'select idTrack, title from Tracks order by title limit $count offset $offset',
    searchSongs: 'select idTrack, title from Tracks where title like $search order by title limit $count offset $offset',

    getPlayLists: 'select * from PlayLists',
    getPlayList: 'select * from PlayLists where idPlayList = $idPlayList',
    addPlayList: 'insert into PlayLists (name) values ($name)',
    updatePlayList: 'update PlayLists set lastPlayed = $lastPlayed, idTracks = $idTracks where idPlayList = $idPlayList',
    renamePlayList: 'update PlayLists set name = $name where idPlayList = $idPlayList',
    deletePlayList: 'delete from PlayLists  where idPlayList = $idPlayList',
  })
  .then((p) => {
    prepared = p;
  })
  .then(() => initRefresh());
}

function splitIdTracks(record) {
  return Object.assign(record, {
    idTracks: (
      record.idTracks
      ? record.idTracks.split(',').map(idTrack => parseInt(idTrack, 10))
      : null
    ),
  });
}

export function refreshDatabase(o) {
  switch (o.options.op) {
    case 'start':
      return startRefresh();
    case 'stop':
      return stopRefresh();
    default:
      return refreshStatus();
  }
}

// getAlbums: 'select * from AllAlbums limit $count offset $offset',
// searchAlbums: 'select * from AllAlbums where album like $search limit $count offset $offset',
export function getAlbums(o) {
  return (
    o.options.search
    ? prepared.searchAlbums.all({
      $count: o.options.count || 20,
      $offset: o.options.offset || 0,
      $search: `%${o.options.search}%`,
    })
    : prepared.getAlbums.all({
      $count: o.options.count || 20,
      $offset: o.options.offset || 0,
    })
  )
  .then(albums => albums.map(splitIdTracks))
  ;
}

// getAlbum: 'select * from AllAlbums where idAlbum = $idAlbum',
export function getAlbum(o) {
  return prepared.getAlbum.get({
    $idAlbum: o.keys.idAlbum,
  })
  .then(splitIdTracks);
}

// getArtists: 'select * from AllArtists limit $count offset $offset',
// searchArtists: 'select * from AllArtists where artist like $search limit $count offset $offset',
export function getArtists(o) {
  return (
    o.options.search
    ? prepared.searchArtists.all({
      $count: o.options.count || 20,
      $offset: o.options.offset || 0,
      $search: `%${o.options.search}%`,
    })
    : prepared.getArtists.all({
      $count: o.options.count || 20,
      $offset: o.options.offset || 0,
    })
  ).then(artists => artists.map(splitIdTracks));
}

// getArtist: 'select * from AllArtists where idArtist = $idArtist',
export function getArtist(o) {
  return prepared.getArtist.get({
    $idArtist: o.keys.idArtist,
  })
  .then(splitIdTracks);
}

// getSongs: 'select idTrack, title from Tracks order by title limit $count offset $offset',
// searchSongs: 'select idTrack, title from Tracks
// where artist like $search order by title limit $count offset $offset',
export function getSongs(o) {
  return (
    o.options.search
    ? prepared.searchSongs.all({
      $count: o.options.count || 20,
      $offset: o.options.offset || 0,
      $search: `%${o.options.search}%`,
    })
    : prepared.getSongs.all({
      $count: o.options.count || 20,
      $offset: o.options.offset || 0,
    })
  );
}

// getTracks: 'select * from AllTracks where idTrack in ($idTracks)',
export function getTracks(o) {
  return db.all(`select * from AllTracks where idTrack in (${o.keys.idTracks})`);
}

// getPlayLists: 'select * from PlayLists order by name',
export function getPlayLists() {
  return prepared.getPlayLists.all()
  .then(playLists => playLists.map(splitIdTracks));
}

// getPlayList: 'select* from PlayLists where idPlayList = $idPlayList',
export function getPlayList(o) {
  return prepared.getPlayList.get({
    $idPlayList: o.keys.idPlayList,
  })
  .then(splitIdTracks);
}

// addPlayList: 'insert into PlayLists (name) values ($name)',
export function addPlayList(o) {
  return prepared.addPlayList.run({ $name: o.data.name });
}

// updatePlayList: 'update PlayLists
// set lastPlayed = $lastPlayed, idTracks = $idTracks where idPlayList = $idPlayList',
export function updatePlayList(o) {
  return prepared.updatePlayList.run({
    $idPlayList: o.keys.idPlayList,
    $lastPlayed: o.data.lastPlayed,
    $idTracks: o.data.idTracks.join(','),
  });
}

// renamePlayList: 'update PlayLists set name = $name where idPlayList = $idPlayList',

export function renamePlayList(o) {
  return prepared.renamePlayList.run({
    $idPlayList: o.keys.idPlayList,
    $name: o.data.name,
  });
}
// deletePlayList: 'delete from PlayLists  where idPlayList = $idPlayList',
export function deletePlayList(o) {
  return prepared.deletePlayList.run({
    $idPlayList: o.keys.idPlayList,
  });
}

export function getConfig(o) {
  return getCfg(o.keys.key);
}

export function setConfig(o) {
  return setCfg(o.keys.key, o.data);
}

function saveOnePlayList(playList) {
  const musicDir = getCfg('musicDir');
  const fileName = join(musicDir, `${playList.name}.m3u`);
  return db.all(
    `select title, duration, location, coalesce(AlbumArtist.artist, Artist.artist) as artist
      from Tracks
      left join People as AlbumArtist on idAlbumArtist = AlbumArtist.idPerson
      left join People as Artist on idAlbumArtist = Artist.idPerson
      where idTrack in (${playList.idTracks})`)
    .then(tracks => tracks.reduce((m3u, track) =>
      `${m3u}
#EXTINF:${track.duration || -1},${track.artist || ''} - ${track.title || ''}
${track.location}`,
      '#EXTM3U'
    ))
    .then(m3u => console.log('----%s\n%s', fileName, m3u))
//    .then(m3u => writeFile(fileName, m3u))
    .then(() => fileName);
}

export function saveAllPlayLists() {
  return prepared.getPlayLists.all()
  .then(playLists => Promise.all(
    playLists.map(saveOnePlayList)
  ));
}

export function savePlayList(o) {
  return getPlayList(o)
  .then(saveOnePlayList);
}
