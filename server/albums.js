import * as validators from '_server/utils/validators';
import splitIdTracks from '_server/utils/splitIdTracks';

let prepared = {};

export function init(db) {
  return db.prepareAll({
    getAlbums: 'select * from AllAlbums limit $count offset $offset',
    searchAlbums: 'select * from AllAlbums where album like $search limit $count offset $offset',
    getAlbum: 'select * from AllAlbums where idAlbum = $idAlbum',
  })
  .then((p) => {
    prepared = p;
  });
}


// getAlbums: 'select * from AllAlbums limit $count offset $offset',
// searchAlbums: 'select * from AllAlbums where album like $search limit $count offset $offset',
export function getAlbums(o) {
  return (
    o.options.search
    ? prepared.searchAlbums.all({
      count: o.options.count || 20,
      offset: o.options.offset || 0,
      search: `%${o.options.search}%`,
    })
    : prepared.getAlbums.all({
      count: o.options.count || 20,
      offset: o.options.offset || 0,
    })
  )
  .then(albums => ({ list: albums.map(splitIdTracks) }))
  ;
}

// getAlbum: 'select * from AllAlbums where idAlbum = $idAlbum',
export function getAlbum(o) {
  return prepared.getAlbum.get(o.keys)
  .then(splitIdTracks);
}


export default db =>
  init(db)
  .then(() => ({
    '/': {
      read: getAlbums,
    },
    '/:idAlbum': {
      read: [
        validators.keyIsInteger('idAlbum'),
        getAlbum,
      ],
    },
  }));
