import restAPI from '_utils/restAPI';
import asyncActionCreator from '_utils/asyncActionCreator';

const api = restAPI('music/PlayLists');

export const GET_PLAY_LISTS = 'playlists/get playlists';
export const GET_PLAY_LIST = 'playlists/get single playlist';
export const REPLACE_PLAY_LIST_TRACKS = 'playlists/replace playlist tracks';
export const RENAME_PLAY_LIST = 'playlists/rename playlist';
export const ADD_PLAY_LIST = 'playlists/replace playlist';
export const DELETE_PLAY_LIST = 'playlists/delete playlist';
export const ADD_TRACK_TO_PLAYLIST = 'playlists/add track to playlist';
export const SELECT_PLAYLIST_FOR_TRACK = 'playlists/select playlist for track';
export const CLOSE_ADD_TO_PLAYLIST = 'playlists/close add to playlist';

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

export function addPlayList(name) {
  return asyncActionCreator(
    ADD_PLAY_LIST,
    api.create('/', { name }),
    { name }
  );
}

export function deletePlayList(idPlayList) {
  return asyncActionCreator(
    DELETE_PLAY_LIST,
    api.delete(idPlayList),
    { idPlayList }
  );
}

export function addTrackToPlaylist(idTrack, idPlayList) {
  if (arguments.length === 1) {
    return {
      type: SELECT_PLAYLIST_FOR_TRACK,
      idTrack,
    };
  }
  return (dispatch, getState) => {
    const playList = getState().playLists.hash[idPlayList];
    return replacePlayListTracks(
      idPlayList,
      playList.idTracks.concat(idTrack),
      playList.lastPlayed
    )(dispatch, getState);
  };
}

export function closeAddToPlaylist() {
  return {
    type: CLOSE_ADD_TO_PLAYLIST,
  };
}
