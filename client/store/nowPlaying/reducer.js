import update from 'react-addons-update';

import {
  PLAY_NEXT_TRACK,
  PLAY_NOW,
  ADD_TO_NOW_PLAYING,
  CLEAR_NOW_PLAYING,
  REPLACE_NOW_PLAYING,
} from './actions';

export default (
  state = {
    nowPlaying: -1,
    playNowList: [],
    loaded: false,
  },
  action
) => {
  const idTrack = action.idTrack;
  switch (action.type) {
    case PLAY_NEXT_TRACK:
      return update(state, { nowPlaying: { $apply: n => (
        state.nowPlaying === state.playNowList.length - 1
        ? -1
        : n + 1
    ) } });
    case PLAY_NOW:
      return update(state, {
        nowPlaying: { $set: state.playNowList.length },
        playNowList: { $push: [idTrack] },
      });
    case ADD_TO_NOW_PLAYING:
      return update(state, { playNowList: { $push: [idTrack] } });
    case CLEAR_NOW_PLAYING:
      return update(state, {
        nowPlaying: { $set: -1 },
        playNowList: { $set: [] },
      });
    case REPLACE_NOW_PLAYING:
      return update(state, {
        nowPlaying: { $set: 0 },
        playNowList: { $set: [idTrack] },
      });
    default:
      return state;
  }
};
