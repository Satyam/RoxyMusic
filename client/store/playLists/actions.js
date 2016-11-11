import restAPI from '_utils/restAPI';
import asyncActionCreator from '_utils/asyncActionCreator';

const api = restAPI('music/PlayLists');

export const GET_PLAY_LISTS = 'playlists/get playlists';
export const GET_PLAY_LIST = 'playlists/get single playlist';
export const REPLACE_PLAY_LIST_TRACKS = 'playlists/replace playlist tracks';
export const RENAME_PLAY_LIST = 'playlists/rename playlist';
export const ADD_PLAY_LIST = 'playlists/replace playlist';
export const DELETE_PLAY_LIST = 'playlists/delete playlist';


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

export function replacePlayListTracks(idPlayList, idTracks, lastPlayed = -1) {
  return asyncActionCreator(
    REPLACE_PLAY_LIST_TRACKS,
    api.update(idPlayList, { lastPlayed, idTracks }),
    { idPlayList, idTracks },
  );
}

export function renamePlayList(idPlayList, name) {
  return asyncActionCreator(
    RENAME_PLAY_LIST,
    api.update(`/${idPlayList}/name`, { name }),
    { idPlayList, name }
  );
}

export function addPlayList(idPlayList, name) {
  return asyncActionCreator(
    ADD_PLAY_LIST,
    api.create(`/${idPlayList}/name`, { name }),
    { idPlayList, name }
  );
}

export function deletePlayList(idPlayList) {
  return asyncActionCreator(
    DELETE_PLAY_LIST,
    api.read(idPlayList),
    { idPlayList }
  );
}
