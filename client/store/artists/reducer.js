import update from 'react-addons-update';

import {
  REPLY_RECEIVED,
} from '_store/requests/actions';

import {
  GET_ARTISTS,
  GET_MORE_ARTISTS,
  GET_ARTIST,
} from './actions';

const indexArtists = (payload, oldIndex = {}) => payload.reduce(
  (artists, item) => Object.assign(artists, { [item.idArtist]: item }),
  oldIndex
);

export const artistSelectors = {};

function initSelectors(key) {
  artistSelectors.list = state => state[key].list;
  artistSelectors.isEmpty = state => state[key].list.length === 0;
  artistSelectors.item = (state, idArtist) => state[key].hash[idArtist] || {};
  artistSelectors.exists = (state, idArtist) => idArtist in state[key].hash;
  artistSelectors.searchTerm = state => state[key].search;
  artistSelectors.nextOffset = state => state[key].nextOffset;
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
  if (action.error) {
    if (action.type === GET_ARTIST) {
      const idArtist = payload.idArtist;
      return update(state, { hash: { $merge: {
        [idArtist]: {
          idArtist,
          error: 404,
        },
      } } });
    }
    return state;
  }
  if (action.stage && action.stage !== REPLY_RECEIVED) return state;
  switch (action.type) {
    case GET_ARTISTS: {
      return {
        search: payload.search || '',
        nextOffset: list.length,
        list,
        hash: indexArtists(list),
      };
    }
    case GET_MORE_ARTISTS: {
      return update(state, {
        nextOffset: { $apply: offset => offset + list.length },
        list: { $push: list },
        hash: { $set: indexArtists(list, state.hash) },
      });
    }
    case GET_ARTIST: {
      return {
        search: '',
        nextOffset: 0,
        list: [payload],
        hash: indexArtists([payload]),
      };
    }
    case '@@selectors':
      initSelectors(action.key);
      return state;
    default:
      return state;
  }
};
