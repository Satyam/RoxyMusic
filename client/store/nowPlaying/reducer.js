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
} from './actions';

export default (
  state = {
    current: -1,
    idTracks: [],
    status: 0,
  },
  action
) => {
  if (action.stage !== REPLY_RECEIVED) return state;
  const payload = action.payload;
  switch (action.type) {
    case PLAY_NEXT_TRACK:
    case PLAY_NOW:
    case ADD_TO_NOW_PLAYING:
    case CLEAR_NOW_PLAYING:
    case REPLACE_NOW_PLAYING:
    case LOAD_NOW_PLAYING:
      switch (action.stage) {
        case REPLY_RECEIVED:
          return Object.assign(payload.value, { status: 2 });
        case REQUEST_SENT:
          return update(state, { status: { $set: 1 } });
        default: return state;
      }
    default:
      return state;
  }
};
