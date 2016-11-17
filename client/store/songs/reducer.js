import update from 'react-addons-update';

import {
  REPLY_RECEIVED,
} from '_store/requests/actions';

import {
  GET_SONGS,
  GET_MORE_SONGS,
} from './actions';

const indexSongs = (payload, oldIndex = {}) => payload.reduce(
  (songs, item) => Object.assign(songs, { [item.idTrack]: item }),
  oldIndex
);

export default (
  state = {
    search: '',
    songList: [],
    nextOffset: 0,
    songHash: {},
  },
  action
) => {
  const payload = action.payload;
  if (action.meta && action.meta.asyncAction !== REPLY_RECEIVED) return state;
  const originalPayload = action.meta && action.meta.originalPayload;
  switch (action.type) {
    case GET_SONGS: {
      return {
        search: originalPayload.search || '',
        nextOffset: payload.length,
        songList: payload,
        songHash: indexSongs(payload),
      };
    }
    case GET_MORE_SONGS: {
      return update(state, {
        nextOffset: { $apply: offset => offset + payload.length },
        songList: { $push: payload },
        songHash: { $set: indexSongs(payload, state.songHash) },
      });
    }
    default:
      return state;
  }
};
