import { prepareAll } from '_server/utils';
import { getConfig as getCfg, setConfig as setCfg } from '_server/config';

import initRefresh, { startRefresh, refreshStatus, stopRefresh } from './refreshDb';

let prepared = {};

export function init() {
  return prepareAll({
    getAlbums: 'select * from AllAlbums limit $count offset $offset',
    searchAlbums: 'select * from AllAlbums where album like $search limit $count offset $offset',
    getAlbum: 'select * from AllAlbums where idAlbum = $idAlbum',

    getArtists: 'select * from AllArtists limit $count offset $offset',
    searchArtists: 'select * from AllArtists where artist like $search limit $count offset $offset',
    getArtist: 'select * from AllArtists where idArtist = $idArtist',

    getPlayLists: 'select * from PlayLists',
    getPlayList: 'select* from PlayLists where idPlayList = $idPlayList',
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
  );
}

// getAlbum: 'select * from AllAlbums where idAlbum = $idAlbum',
export function getAlbum(o) {
  return prepared.getAlbum.get({
    $idAlbum: o.keys.idAlbum,
  })
  .then(album => Object.assign(
    album,
    { idTracks: album.idTracks.split(',').map(idTrack => parseInt(idTrack, 10)),
  }));
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
  );
}

// getArtist: 'select * from AllArtists where idArtist = $idArtist',
export function getArtist(o) {
  return prepared.getArtist.get({
    $idArtist: o.keys.idArtist,
  })
  .then(album => Object.assign(
    album,
    { idTracks: album.idTracks.split(',').map(idTrack => parseInt(idTrack, 10)),
  }));
}


// getTracks: 'select * from AllTracks where idTrack in ($idTracks)',
export function getTracks(o) {
  return db.all(`select * from AllTracks where idTrack in (${o.keys.idTracks})`);
}

function splitIdTracks(playList) {
  return Object.assign(playList, {
    idTracks: (
      playList.idTracks
      ? playList.idTracks.split(',').map(idTrack => parseInt(idTrack, 10))
      : null
    ),
  });
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
