import restAPI from '_platform/restAPI';
import asyncActionCreator from '_utils/asyncActionCreator';

import { artistSelectors } from '_store/selectors';

const NAME = 'artists';
const api = restAPI(NAME);

export const GET_ARTISTS = `${NAME}/get artists`;
export const GET_MORE_ARTISTS = `${NAME}/get more artists`;
export const GET_ARTIST = `${NAME}/get artist`;

export function getArtists(search) {
  return asyncActionCreator(
    GET_ARTISTS,
    api.read(search ? `?search=${search}` : ''),
    { search }
  );
}

export function getMoreArtists() {
  return (dispatch, getState) => {
    const state = getState();
    const search = artistSelector.searchTerm(state);
    const offset = artistSelector.nextOffset(state);

    return dispatch(asyncActionCreator(
      GET_MORE_ARTISTS,
      api.read(`?search=${search}&offset=${offset}`),
      { search, offset }
    ));
  };
}

export function getArtist(idArtist) {
  return asyncActionCreator(
    GET_ARTIST,
    api.read(idArtist),
    { idArtist }
  );
}
