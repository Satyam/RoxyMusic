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
  if (action.error) {
    if (action.type === GET_ARTIST) {
      const idArtist = payload.originalPayload.idArtist;
      return update(state, { artists: { $merge: {
        [idArtist]: {
          idArtist,
          error: 404,
        },
      } } });
    }
    return state;
  } else if (action.meta && action.meta.asyncAction !== REPLY_RECEIVED) return state;
  const originalPayload = action.meta && action.meta.originalPayload;
  switch (action.type) {
    case GET_ARTISTS: {
      return {
        search: originalPayload.search || '',
        nextOffset: payload.length,
        artistList: payload,
        artistHash: indexArtists(payload),
      };
    }
    case GET_MORE_ARTISTS: {
      return update(state, {
        nextOffset: { $apply: offset => offset + payload.length },
        artistList: { $push: payload },
        artistHash: { $set: indexArtists(payload, state.artistHash) },
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
