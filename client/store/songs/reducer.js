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
    hash: {},
  },
  action
) => {
  const payload = action.payload;
  const list = payload && payload.list;
  if (action.stage !== REPLY_RECEIVED) return state;
  switch (action.type) {
    case GET_SONGS: {
      return {
        search: payload.search || '',
        nextOffset: list.length,
        songList: list,
        hash: indexSongs(list),
      };
    }
    case GET_MORE_SONGS: {
      return update(state, {
        nextOffset: { $apply: offset => offset + list.length },
        songList: { $push: list },
        hash: { $set: indexSongs(list, state.hash) },
      });
    }
    default:
      return state;
  }
};
