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
    list: [],
    nextOffset: 0,
    hash: {},
  },
  action
) => {
  const payload = action.payload;
  const list = payload && payload.list;
  if (action.error) {
    if (action.type === GET_ALBUM) {
      const idAlbum = payload.idAlbum;
      return update(state, { hash: { $merge: {
        [idAlbum]: {
          idAlbum,
          error: 404,
        },
      } } });
    }
    return state;
  }
  if (action.stage && action.stage !== REPLY_RECEIVED) return state;
  switch (action.type) {
    case GET_ALBUMS: {
      return {
        search: payload.search || '',
        nextOffset: list.length,
        list,
        hash: indexAlbums(list),
      };
    }
    case GET_MORE_ALBUMS: {
      return update(state, {
        nextOffset: { $apply: offset => offset + list.length },
        list: { $push: list },
        hash: { $set: indexAlbums(list, state.hash) },
      });
    }
    case GET_ALBUM: {
      return {
        search: '',
        nextOffset: 0,
        list: [payload],
        hash: indexAlbums([payload]),
      };
    }
    default:
      return state;
  }
};
