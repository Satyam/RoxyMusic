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

export const songSelectors = {};

function initSelectors(key) {
  songSelectors.list = state => state[key].list;
  songSelectors.isEmpty = state => state[key].list.length === 0;
  songSelectors.searchTerm = state => state[key].search;
  songSelectors.nextOffset = state => state[key].nextOffset;
}

export default (
  state = {
    search: '',
    list: [],
    nextOffset: 0,
    hash: {},
  },
  action
) => {
  const payload = action.payload;
  const list = payload && payload.list;
  if (action.stage && action.stage !== REPLY_RECEIVED) return state;
  switch (action.type) {
    case GET_SONGS: {
      return {
        search: payload.search || '',
        nextOffset: list.length,
        list,
        hash: indexSongs(list),
      };
    }
    case GET_MORE_SONGS: {
      return update(state, {
        nextOffset: { $apply: offset => offset + list.length },
        list: { $push: list },
        hash: { $set: indexSongs(list, state.hash) },
      });
    }
    case '@@selectors':
      initSelectors(action.key);
      return state;
    default:
      return state;
  }
};
