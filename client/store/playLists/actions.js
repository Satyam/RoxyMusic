import restAPI from '_platform/restAPI';
import asyncActionCreator from '_utils/asyncActionCreator';
import intersection from 'lodash/intersection';
import without from 'lodash/without';
import {
  playListSelectors,
  albumSelectors,
} from '_store/selectors';

const NAME = 'playlists';
const api = restAPI(NAME);

export const GET_PLAY_LISTS = `${NAME}/get playlists`;
export const GET_PLAY_LIST = `${NAME}/get single playlist`;
export const UPDATE_PLAYLIST = `${NAME}/update playlist`;
export const ADD_PLAY_LIST = `${NAME}/add playlist`;
export const DELETE_PLAY_LIST = `${NAME}/delete playlist`;
export const ADD_TRACK_TO_PLAYLIST = `${NAME}/add track to playlist`;
export const SELECT_PLAYLIST_FOR_TRACK = `${NAME}/select playlist for track`;
export const DUPLICATE_PLAYLIST_FOR_TRACK = `${NAME}/track already exists in playlist`;
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

// The idDevice is only used on operations involving remote synchronization
// all local operations are done without it.

export function updatePlayList(idPlayList, name, idTracks, idDevice = 0) {
  return asyncActionCreator(
    UPDATE_PLAYLIST,
    api.update(idPlayList, { name, idTracks, idDevice }),
    { idPlayList, name, idTracks, idDevice },
  );
}

export function deleteTrackFromPlaylist(idPlayList, idTrack) {
  return (dispatch, getState) => {
    const playList = playListSelectors.item(getState(), idPlayList);
    const idTracks = without(playList.idTracks, idTrack);
    return dispatch(updatePlayList(idPlayList, playList.name, idTracks));
  };
}

export function addPlayList(name, idTracks = [], idPlayList = '', idDevice = 0) {
  return asyncActionCreator(
    ADD_PLAY_LIST,
    api.create(`/${idPlayList}`, { name, idTracks, idDevice }),
    { name, idTracks, idDevice }
  );
}

export function deletePlayList(idPlayList, idDevice = 0) {
  return asyncActionCreator(
    DELETE_PLAY_LIST,
    api.delete(idPlayList, { idDevice }),
    { idPlayList, idDevice }
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
    const state = getState();
    const playList = playListSelectors.item(state, idPlayList);
    let idTracksToAdd = playListSelectors.tracksToAdd(state);
    const duplicates = intersection(idTracksToAdd, playList.idTracks);
    if (duplicates.length) {
      dispatch({
        type: DUPLICATE_PLAYLIST_FOR_TRACK,
        payload: {
          idTracks: duplicates,
          name: playList.name,
          idPlayList,
        },
      });
      idTracksToAdd = without(idTracksToAdd, ...duplicates);
    } else {
      dispatch(closeAddToPlayList());
    }
    if (idTracksToAdd.length) {
      return dispatch(updatePlayList(
        idPlayList,
        playList.name,
        playList.idTracks.concat(idTracksToAdd)
      ));
    }
    return null;
  };
}

export function addTracksToNewPLaylist(name) {
  return (dispatch, getState) => {
    const idTracksToAdd = playListSelectors.tracksToAdd(getState());
    dispatch(addPlayList(name, idTracksToAdd))
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
    dispatch(selectPlayListToAddTracksTo(albumSelectors.item(getState(), idAlbum).idTracks));
}
