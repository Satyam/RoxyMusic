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

const SUB_STORE = 'artists';
export const artistSelectors = {
  list: state => state[SUB_STORE].list,
  isEmpty: state => state[SUB_STORE].list.length === 0,
  item: (state, idArtist) => state[SUB_STORE].hash[idArtist] || {},
  exists: (state, idArtist) => idArtist in state[SUB_STORE].hash,
  searchTerm: state => state[SUB_STORE].search,
  nextOffset: state => state[SUB_STORE].nextOffset,
};

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
    default:
      return state;
  }
};
