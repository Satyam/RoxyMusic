import restAPI from '_utils/restAPI';
import asyncActionCreator from '_utils/asyncActionCreator';

const api = restAPI('music/PlayLists');

export const GET_PLAY_LISTS = 'playlists/get playlists';
export const GET_PLAY_LIST = 'playlists/get single playlist';

export function getPlayLists() {
  return asyncActionCreator(
    GET_PLAY_LISTS,
    api.read('/')
  );
}

export function getPlayList(idPlayList) {
  return asyncActionCreator(
    GET_PLAY_LIST,
    api.read(idPlayList),
    { idPlayList }
  );
}
