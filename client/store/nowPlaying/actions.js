import restAPI from '_utils/restAPI';
import asyncActionCreator from '_utils/asyncActionCreator';

const api = restAPI('config');

export const PLAY_NEXT_TRACK = 'now playing/play next track in now playing list';
export const PLAY_NOW = 'now playing/play now';
export const ADD_TO_NOW_PLAYING = 'now playing/add track to now playing list';
export const CLEAR_NOW_PLAYING = 'now playing/clear now playing list';
export const REPLACE_NOW_PLAYING = 'now playing/replace now playing list';
export const LOAD_NOW_PLAYING = 'now playing/load now playing list';

function update(action, idTracks = [], current = -1) {
  const what = {
    current,
    idTracks,
  };
  return asyncActionCreator(
    action,
    api.update('nowPlaying', what),
    what,
  );
}

export function playNow(idTrack) {
  return (dispatch, getState) => {
    const idTracks = getState().nowPlaying.idTracks;
    const index = idTracks.indexOf(idTrack);
    return (
      index === -1
      ? update(PLAY_NOW, idTracks.concat(idTrack), idTracks.length)
      : update(PLAY_NOW, idTracks, index)
    )(dispatch);
  };
}

export function addToNowPlaying(idTrack) {
  return (dispatch, getState) => {
    const nowPlaying = getState().nowPlaying;
    return update(PLAY_NOW, nowPlaying.idTracks.concat(idTrack), nowPlaying.current)(dispatch);
  };
}

export function clearNowPlaying() {
  return update(CLEAR_NOW_PLAYING, [], -1);
}

export function replaceNowPlaying(idTrack) {
  return update(REPLACE_NOW_PLAYING, [idTrack], 0);
}

export function playNextTrack() {
  return (dispatch, getState) => {
    const nowPlaying = getState().nowPlaying;
    const next = (
      nowPlaying.current < nowPlaying.idTracks.length - 1
      ? nowPlaying.current + 1
      : -1
    );
    return update(PLAY_NEXT_TRACK, nowPlaying.idTracks, next)(dispatch);
  };
}

export function loadPlayingList() {
  return asyncActionCreator(
    LOAD_NOW_PLAYING,
    api.read('nowPlaying')
  );
}
