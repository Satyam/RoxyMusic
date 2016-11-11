// import update from 'react-addons-update';

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
} from './actions';

export default (
  state = {
    current: -1,
    idTracks: [],
    loaded: false,
  },
  action
) => {
  if (action.meta && action.meta.asyncAction !== REPLY_RECEIVED) return state;
  const payload = action.payload;
  const original = action.meta && action.meta.originalPayload;
  switch (action.type) {
    case PLAY_NEXT_TRACK:
    case PLAY_NOW:
    case ADD_TO_NOW_PLAYING:
    case CLEAR_NOW_PLAYING:
    case REPLACE_NOW_PLAYING:
      return original;
    case LOAD_NOW_PLAYING:
      return Object.assign(payload, { loaded: true });
    default:
      return state;
  }
};
