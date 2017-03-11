import {
  REPLY_RECEIVED,
} from '_store/requests/actions';

import {
  PLAY_NEXT_TRACK,
  PLAY_NOW,
  ADD_TO_NOW_PLAYING,
  CLEAR_NOW_PLAYING,
  REPLACE_NOW_PLAYING,
  LOAD_NOW_PLAYING,
  REORDER_NOW_PLAYING_TRACKS,
} from './actions';

const SUB_STORE = 'nowPlaying';
export const nowPlayingSelectors = {
  loaded: state => state[SUB_STORE].loaded,
  on: state => state[SUB_STORE].current !== -1,
  idTracks: state => state[SUB_STORE].idTracks,
  currentIdTrack: state => state[SUB_STORE].idTracks[state[SUB_STORE].current],
  current: state => state[SUB_STORE].current,
  hasNext: state =>
    state[SUB_STORE].idTracks.length > ((state[SUB_STORE].current + 1) || 0),
};

export default (
  state = {
    current: -1,
    idTracks: [],
    loaded: false,
  },
  action
) => {
  if (action.stage !== REPLY_RECEIVED) return state;
  const payload = action.payload.value;
  switch (action.type) {
    case PLAY_NEXT_TRACK:
    case PLAY_NOW:
    case ADD_TO_NOW_PLAYING:
    case CLEAR_NOW_PLAYING:
    case REPLACE_NOW_PLAYING:
    case REORDER_NOW_PLAYING_TRACKS:
      return Object.assign(payload, { loaded: state.loaded });
    case LOAD_NOW_PLAYING:
      return Object.assign(payload, { loaded: true });
    default:
      return state;
  }
};
