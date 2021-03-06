import restAPI from '_platform/restAPI';
import asyncActionCreator from '_utils/asyncActionCreator';
import { getTrack } from '_store/tracks/actions';
import { songSelectors } from '_store/selectors';

const NAME = 'songs';
const api = restAPI(NAME);

export const GET_SONGS = `${NAME}/get songs`;
export const GET_MORE_SONGS = `${NAME}/get more songs`;

export function getSongs(search) {
  return asyncActionCreator(
    GET_SONGS,
    api.read(search ? `?search=${search}` : ''),
    { search }
  );
}

export function getMoreSongs() {
  return (dispatch, getState) => {
    const state = getState();
    const search = songSelectors.searchTerm(state);
    const offset = songSelectors.nextOffset(state);
    return dispatch(asyncActionCreator(
      GET_MORE_SONGS,
      api.read(`?search=${search}&offset=${offset}`),
      { search, offset }
    ));
  };
}

export const getSong = getTrack;
