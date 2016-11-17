import restAPI from '_utils/restAPI';
import asyncActionCreator from '_utils/asyncActionCreator';
import { getTrack } from '_store/tracks/actions';

const api = restAPI('music/songs');

export const GET_SONGS = 'songs/get songs';
export const GET_MORE_SONGS = 'songs/get more songs';

export function getSongs(search) {
  return asyncActionCreator(
    GET_SONGS,
    api.read(search ? `?search=${search}` : ''),
    { search }
  );
}

export function getMoreSongs(search, offset) {
  return asyncActionCreator(
    GET_MORE_SONGS,
    api.read(`?search=${search}&offset=${offset}`),
    { search, offset }
  );
}

export const getSong = getTrack;
