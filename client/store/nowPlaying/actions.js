import restAPI from '_platform/restAPI';
import asyncActionCreator from '_utils/asyncActionCreator';
import difference from 'lodash/difference';

import {
  nowPlayingSelectors,
  albumSelectors,
} from '_store/selectors';

const NAME = 'now playing';
const api = restAPI('config');

export const PLAY_NEXT_TRACK = `${NAME}/play next track in now playing list`;
export const PLAY_NOW = `${NAME}/play now`;
export const ADD_TO_NOW_PLAYING = `${NAME}/add track to now playing list`;
export const CLEAR_NOW_PLAYING = `${NAME}/clear now playing list`;
export const REPLACE_NOW_PLAYING = `${NAME}/replace now playing list`;
export const LOAD_NOW_PLAYING = `${NAME}/load now playing list`;
export const PLAY_ALBUM_NOW = `${NAME}/play album now`;
export const ADD_ALBUM_TO_NOW_PLAYING = `${NAME}/add album to now playing list`;
export const REPLACE_ALBUM_NOW_PLAYING = `${NAME}/replace album in now playing list`;
export const REORDER_NOW_PLAYING_TRACKS = `${NAME}/reorder tracks in now playing list`;

function update(action, idTracks = [], current = -1) {
  const what = { value: {
    current,
    idTracks,
  } };
  return asyncActionCreator(
    action,
    api.update('nowPlaying', what),
    what,
  );
}

export function playNow(idTrack) {
  return (dispatch, getState) => {
    const idTracks = nowPlayingSelectors.idTracks(getState());
    const index = idTracks.indexOf(idTrack);
    return (
      index === -1
      ? dispatch(update(PLAY_NOW, idTracks.concat(idTrack), idTracks.length))
      : dispatch(update(PLAY_NOW, idTracks, index))
    );
  };
}

export function addToNowPlaying(idTracks) {
  return (dispatch, getState) => dispatch(update(
    PLAY_NOW,
    // To avoid duplicate tracks in the list, the first existing track is dropped
    // and the new instance relocated to the back;
    difference(nowPlayingSelectors.idTracks(getState()), idTracks).concat(idTracks),
    nowPlayingSelectors.current(getState())
  ));
}

export function clearNowPlaying() {
  return update(CLEAR_NOW_PLAYING, [], -1);
}

export function replaceNowPlaying(idTracks) {
  return update(REPLACE_NOW_PLAYING, idTracks, 0);
}

export function playNextTrack() {
  return (dispatch, getState) => {
    const state = getState();
    const next = (
      nowPlayingSelectors.hasNext(state)
      ? nowPlayingSelectors.current(state) + 1
      : -1
    );
    return dispatch(update(PLAY_NEXT_TRACK, nowPlayingSelectors.idTracks(state), next));
  };
}

export function loadNowPlayingList() {
  return (dispatch, getState) => {
    if (!nowPlayingSelectors.loading(getState())) {
      return dispatch(asyncActionCreator(
        LOAD_NOW_PLAYING,
        api.read('nowPlaying')
      ));
    }
    return null;
  };
}

export function playAlbumNow(idAlbum) {
  return (dispatch, getState) => {
    const idTracks = albumSelectors.item(getState(), idAlbum).idTracks;
    return dispatch(playNow(idTracks.shift()))
      .then(() => idTracks.length && dispatch(addToNowPlaying(idTracks)));
  };
}

export function addAlbumToPlayNow(idAlbum) {
  return (dispatch, getState) =>
    dispatch(addToNowPlaying(albumSelectors.item(getState(), idAlbum).idTracks));
}

export function replaceAlbumInPlayNow(idAlbum) {
  return (dispatch, getState) =>
    dispatch(replaceNowPlaying(albumSelectors.item(getState(), idAlbum).idTracks));
}

export function reorderNowPlayingTracks(idTracks) {
  return (dispatch, getState) => {
    const newCurrent = idTracks.indexOf(nowPlayingSelectors.currentIdTrack(getState()));
    return dispatch(update(REORDER_NOW_PLAYING_TRACKS, idTracks, newCurrent));
  };
}
