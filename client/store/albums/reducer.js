import update from 'react-addons-update';
import pick from 'lodash/pick';

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
    case GET_ALBUM: {
      const firstRow = payload[0];
      const idAlbum = firstRow.idAlbum;
      let newState = (
        idAlbum in state
        ? state
        : update(state, { $merge: {
          [idAlbum]: pick(firstRow, [
            'albumArtist',
            'idAlbum',
          ]),
        } })
      );
      if (!newState[idAlbum].numTracks) {
        newState = update(newState, { [idAlbum]: { numTracks: { $set: payload.length } } });
      }
      if (!newState[idAlbum].artists) {
        newState = update(newState, { [idAlbum]: { artists:
          { $set: payload.reduce((list, row) => (row.artist ? `${list}, ${row.artist}` : list), '') },
        } });
      }
      if (!newState[idAlbum].idTracks) {
        newState = update(newState, { [idAlbum]: { idTracks:
          { $set: payload.map(row => row.idTrack) },
        } });
      }
      return newState;
    }
    default:
      return state;
  }
};
