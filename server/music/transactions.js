import { prepareAll } from '_server/utils';

import initRefresh, { startRefresh, refreshStatus, stopRefresh } from './refreshDb';

let prepared = {};

export function init() {
  return prepareAll({
    getAlbums: 'select * from AllAlbums limit $count offset $offset',
    searchAlbums: 'select * from AllAlbums where album like $search limit $count offset $offset',
    getAlbum: 'select * from AllAlbums where idAlbum = $idAlbum',
    getAlbumTracks: 'select * from AllTracks where idAlbum = $idAlbum',
    getTrack: 'select * from AllTracks where idTrack = $idTrack',
    getPlayLists: 'select * from AllPlayLists order by name',
    getPlayListTracks: 'select idTrack from PlayListTracks where idPlayList = $idPlayList order by `idPlayListTrack`',
    deletePlayListTracks: 'delete from PlayListTracks where idPlayList = $idPlayList',
    addPlayListTrack: 'insert into PlayListTracks (idPlayList, idTrack) values ($idPlayList, $idTrack)',
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

export function getAlbum(o) {
  return prepared.getAlbum.all({
    $idAlbum: o.keys.idAlbum,
  });
}

export function getTrack(o) {
  return prepared.getTrack.all({
    $idTrack: o.keys.idTrack,
  });
}

export function getAlbumTracks(o) {
  return prepared.getAlbumTracks.all({
    $idAlbum: o.keys.idAlbum,
  });
}

export function getPlayLists() {
  return prepared.getPlayLists.all();
}

export function getPlayListTracks(o) {
  return prepared.getPlayListTracks.all({
    $idPlayList: o.keys.idPlayList || 0, // 0 ==> Now
  });
}

export function replacePlayListTracks(o) {
  const idPlayList = o.keys.idPlayList;
  return prepared.deletePlayListTracks.run(idPlayList)
  .then(Promise.all(o.data.map(idTrack =>
    prepared.addPlayListTrack({
      $idPlayList: idPlayList,
      $idTrack: idTrack,
    })
  )));
}
