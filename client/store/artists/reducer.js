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

export default (
  state = {
    search: '',
    artistList: [],
    nextOffset: 0,
    artistHash: {},
  },
  action
) => {
  const payload = action.payload;
  const list = payload && payload.list;
  if (action.error) {
    if (action.type === GET_ARTIST) {
      const idArtist = payload.idArtist;
      return update(state, { artists: { $merge: {
        [idArtist]: {
          idArtist,
          error: 404,
        },
      } } });
    }
    return state;
  }
  if (action.stage !== REPLY_RECEIVED) return state;
  switch (action.type) {
    case GET_ARTISTS: {
      return {
        search: payload.search || '',
        nextOffset: list.length,
        artistList: list,
        artistHash: indexArtists(list),
      };
    }
    case GET_MORE_ARTISTS: {
      return update(state, {
        nextOffset: { $apply: offset => offset + list.length },
        artistList: { $push: list },
        artistHash: { $set: indexArtists(list, state.artistHash) },
      });
    }
    case GET_ARTIST: {
      return {
        search: '',
        nextOffset: 0,
        artistList: [payload],
        artistHash: indexArtists([payload]),
      };
    }
    default:
      return state;
  }
};
