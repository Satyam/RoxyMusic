import { Router as createRouter } from 'express';
import handleRequest from '_server/utils/handleRequest';
import * as validators from '_server/utils/validators';
import splitIdTracks from '_server/utils/splitIdTracks';

let prepared = {};

export function init() {
  return db.prepareAll({
    getArtists: 'select * from AllArtists limit $count offset $offset',
    searchArtists: 'select * from AllArtists where artist like $search limit $count offset $offset',
    getArtist: 'select * from AllArtists where idArtist = $idArtist',
  })
  .then((p) => {
    prepared = p;
  });
}

// getArtists: 'select * from AllArtists limit $count offset $offset',
// searchArtists: 'select * from AllArtists where artist like $search limit $count offset $offset',
export function getArtists(o) {
  return (
    o.options.search
    ? prepared.searchArtists.all({
      count: o.options.count || 20,
      offset: o.options.offset || 0,
      search: `%${o.options.search}%`,
    })
    : prepared.getArtists.all({
      count: o.options.count || 20,
      offset: o.options.offset || 0,
    })
  ).then(artists => artists.map(splitIdTracks));
}

// getArtist: 'select * from AllArtists where idArtist = $idArtist',
export function getArtist(o) {
  return prepared.getArtist.get(o.keys)
  .then(splitIdTracks);
}


export default () =>
  init()
  .then(() => createRouter()
    .get('/', handleRequest(
      getArtists
    ))
    .get('/:idArtist', handleRequest(
      validators.idArtist,
      getArtist
    ))
  );
