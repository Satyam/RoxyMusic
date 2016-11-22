import restAPI from '_utils/restAPI';
import asyncActionCreator from '_utils/asyncActionCreator';

const api = restAPI('artists');

export const GET_ARTISTS = 'artists/get artists';
export const GET_MORE_ARTISTS = 'artists/get more artists';
export const GET_ARTIST = 'artists/get artist';

export function getArtists(search) {
  return asyncActionCreator(
    GET_ARTISTS,
    api.read(search ? `?search=${search}` : ''),
    { search }
  );
}

export function getMoreArtists(search, offset) {
  return asyncActionCreator(
    GET_MORE_ARTISTS,
    api.read(`?search=${search}&offset=${offset}`),
    { search, offset }
  );
}

export function getArtist(idArtist) {
  return asyncActionCreator(
    GET_ARTIST,
    api.read(idArtist),
    { idArtist }
  );
}
