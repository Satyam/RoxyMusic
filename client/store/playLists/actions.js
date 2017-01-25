import restAPI from '_platform/restAPI';
import asyncActionCreator from '_utils/asyncActionCreator';

const NAME = 'playlists';
const api = restAPI(NAME);

export const GET_PLAY_LISTS = `${NAME}/get playlists`;
export const GET_PLAY_LIST = `${NAME}/get single playlist`;
export const REPLACE_PLAY_LIST_TRACKS = `${NAME}/replace playlist tracks`;
export const RENAME_PLAY_LIST = `${NAME}/rename playlist`;
export const ADD_PLAY_LIST = `${NAME}/add playlist`;
export const DELETE_PLAY_LIST = `${NAME}/delete playlist`;
export const ADD_TRACK_TO_PLAYLIST = `${NAME}/add track to playlist`;
export const SELECT_PLAYLIST_FOR_TRACK = `${NAME}/select playlist for track`;
export const CLOSE_ADD_TO_PLAYLIST = `${NAME}/close add to playlist`;
export const SAVE_ALL_PLAYLISTS = `${NAME}/save all playlists`;
export const SAVE_PLAYLIST = `${NAME}/save playlist`;

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
    api.update(`/rename/${idPlayList}`, { name }),
    { idPlayList, name }
  );
}

export function addPlayList(name, idTracks = [], idPlayList = '') {
  return asyncActionCreator(
    ADD_PLAY_LIST,
    api.create(`/${idPlayList}`, { name, idTracks }),
    { name, idTracks }
  );
}

export function deletePlayList(idPlayList) {
  return asyncActionCreator(
    DELETE_PLAY_LIST,
    api.delete(idPlayList),
    { idPlayList }
  );
}

export function selectPlayListToAddTracksTo(idTracks) {
  return {
    type: SELECT_PLAYLIST_FOR_TRACK,
    idTracks: (Array.isArray(idTracks) ? idTracks : [idTracks]),
  };
}

export function closeAddToPlayList() {
  return {
    type: CLOSE_ADD_TO_PLAYLIST,
  };
}

export function addTracksToPlayList(idPlayList) {
  return (dispatch, getState) => {
    const playLists = getState().playLists;
    const playList = playLists.hash[idPlayList];
    const idTracks = playLists.idTracksToAdd;
    return dispatch(replacePlayListTracks(
      idPlayList,
      playList.idTracks.concat(idTracks),
      playList.lastPlayed
    ))
    .then(() => dispatch(closeAddToPlayList()));
  };
}

export function addTracksToNewPLaylist(name) {
  return (dispatch, getState) => {
    const playLists = getState().playLists;
    const idTracks = playLists.idTracksToAdd;
    dispatch(addPlayList(name, idTracks))
    .then(() => dispatch(closeAddToPlayList()));
  };
}

export function saveAllPlayLists() {
  return asyncActionCreator(
    SAVE_ALL_PLAYLISTS,
    api.create('saveAll')
  );
}

export function savePlayList(idPlayList) {
  return asyncActionCreator(
    SAVE_PLAYLIST,
    api.create(`/save/${idPlayList}`),
    { idPlayList }
  );
}

export function addAlbumToPlayList(idAlbum) {
  return (dispatch, getState) =>
    dispatch(selectPlayListToAddTracksTo(getState().albums.hash[idAlbum].idTracks));
}
