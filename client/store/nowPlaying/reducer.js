import update from 'react-addons-update';

import {
  REPLY_RECEIVED,
  REQUEST_SENT,
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

export const nowPlayingSelectors = {};

function initSelectors(key) {
  nowPlayingSelectors.loading = state => state[key].status !== 0;
  nowPlayingSelectors.isReady = state => state[key].status === 2;
  nowPlayingSelectors.on = state => state[key].current !== -1;
  nowPlayingSelectors.idTracks = state => state[key].idTracks;
  nowPlayingSelectors.currentIdTrack = state => state[key].idTracks[state[key].current];
  nowPlayingSelectors.current = state => state[key].current;
  nowPlayingSelectors.hasNext = state =>
    state[key].idTracks.length > ((state[key].current + 1) || 0);
}

export default (
  state = {
    current: -1,
    idTracks: [],
    status: 0,
  },
  action
) => {
  const payload = action.payload;
  switch (action.type) {
    case PLAY_NEXT_TRACK:
    case PLAY_NOW:
    case ADD_TO_NOW_PLAYING:
    case CLEAR_NOW_PLAYING:
    case REPLACE_NOW_PLAYING:
    case LOAD_NOW_PLAYING:
    case REORDER_NOW_PLAYING_TRACKS:
      switch (action.stage) {
        case REPLY_RECEIVED:
          return Object.assign(payload.value, { status: 2 });
        case REQUEST_SENT:
          return update(state, { status: { $set: 1 } });
        default: return state;
      }
    case '@@selectors':
      initSelectors(action.key);
      return state;
    default:
      return state;
  }
};
