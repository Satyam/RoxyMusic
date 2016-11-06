export const PLAY_NEXT_TRACK = 'now playing/play next track in now playing list';
export const PLAY_NOW = 'now playing/play now';
export const ADD_TO_NOW_PLAYING = 'now playing/add track to now playing list';
export const CLEAR_NOW_PLAYING = 'now playing/clear now playing list';
export const REPLACE_NOW_PLAYING = 'now playing/replace now playing list';
export const LOAD_PLAYING_LIST = 'now playing/load now playing list';

export function playNextTrack() {
  return {
    type: PLAY_NEXT_TRACK,
  };
}


export function playNow(idTrack) {
  return {
    type: PLAY_NOW,
    idTrack,
  };
}

export function addToNowPlaying(idTrack) {
  return {
    type: ADD_TO_NOW_PLAYING,
    idTrack,
  };
}

export function clearNowPlaying() {
  return {
    type: CLEAR_NOW_PLAYING,
  };
}

export function replaceNowPlaying(idTrack) {
  return {
    type: REPLACE_NOW_PLAYING,
    idTrack,
  };
}

export function loadPlayingList() {
  return {
    type: LOAD_PLAYING_LIST,
  };
}
