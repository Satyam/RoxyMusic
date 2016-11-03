import { prepareAll } from '_server/utils';

import initRefresh, { startRefresh, refreshStatus, stopRefresh } from './refreshDb';

let prepared = {};

export function init() {
  return prepareAll({
    getAlbums: 'select * from AllAlbums limit $count offset $offset',
    searchAlbums: 'select * from AllAlbums where album like $search limit $count offset $offset',
    getAlbum: 'select * from AllAlbums where idAlbum = $idAlbum',
    getTracksForAlbum: 'select * from AllTracks where idAlbum = $idAlbum',
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
  return prepared.getTracksForAlbum.all({
    $idAlbum: o.keys.idAlbum,
  });
}
