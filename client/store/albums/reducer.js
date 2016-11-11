import update from 'react-addons-update';

import {
  REPLY_RECEIVED,
} from '_store/requests/actions';

import {
  GET_ALBUMS,
  GET_MORE_ALBUMS,
  GET_ALBUM,
} from './actions';

const indexAlbums = (payload, oldIndex = {}) => payload.reduce(
  (albums, item) => Object.assign(albums, { [item.idAlbum]: item }),
  oldIndex
);

export default (
  state = {
    search: '',
    albumList: [],
    nextOffset: 0,
    albumHash: {},
  },
  action
) => {
  const payload = action.payload;
  if (action.error) {
    if (action.type === GET_ALBUM) {
      const idAlbum = payload.originalPayload.idAlbum;
      return update(state, { albums: { $merge: {
        [idAlbum]: {
          idAlbum,
          error: 404,
        },
      } } });
    }
    return state;
  } else if (action.meta && action.meta.asyncAction !== REPLY_RECEIVED) return state;
  const originalPayload = action.meta && action.meta.originalPayload;
  switch (action.type) {
    case GET_ALBUMS: {
      return {
        search: originalPayload.search || '',
        nextOffset: payload.length,
        albumList: payload,
        albumHash: indexAlbums(payload),
      };
    }
    case GET_MORE_ALBUMS: {
      return update(state, {
        nextOffset: { $apply: offset => offset + payload.length },
        albumList: { $push: payload },
        albumHash: { $set: indexAlbums(payload, state.albumHash) },
      });
    }
    case GET_ALBUM: {
      return {
        search: '',
        nextOffset: 0,
        albumList: [payload],
        albumHash: indexAlbums([payload]),
      };
    }
    default:
      return state;
  }
};
