import update from 'react-addons-update';

import {
  REPLY_RECEIVED,
} from '_store/requests/actions';

import {
  GET_ALBUMS,
  GET_ALBUM,
} from './actions';

export default (state = [], action) => {
  const payload = action.payload;
  if (action.error) {
    if (action.type === GET_ALBUM) {
      const idAlbum = payload.originalPayload.idAlbum;
      return update(state, { $merge: {
        [idAlbum]: {
          idAlbum,
          error: 404,
        },
      } });
    }
    return state;
  } else if (action.meta && action.meta.asyncAction !== REPLY_RECEIVED) return state;
  switch (action.type) {
    case GET_ALBUMS:
      return update(state, { $merge: payload.reduce(
        (newAlbums, album) => (
          album.idAlbum in state
          ? newAlbums
          : Object.assign(newAlbums, { [album.idAlbum]: album })
        ),
        {}
      ) });
    case GET_ALBUM:
      return state;
    default:
      return state;
  }
};
