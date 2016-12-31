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
  const list = payload && payload.list;
  if (action.error) {
    if (action.type === GET_ALBUM) {
      const idAlbum = payload.idAlbum;
      return update(state, { albumHash: { $merge: {
        [idAlbum]: {
          idAlbum,
          error: 404,
        },
      } } });
    }
    return state;
  }
  if (action.stage !== REPLY_RECEIVED) return state;
  switch (action.type) {
    case GET_ALBUMS: {
      return {
        search: payload.search || '',
        nextOffset: list.length,
        albumList: list,
        albumHash: indexAlbums(list),
      };
    }
    case GET_MORE_ALBUMS: {
      return update(state, {
        nextOffset: { $apply: offset => offset + list.length },
        albumList: { $push: list },
        albumHash: { $set: indexAlbums(list, state.albumHash) },
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
