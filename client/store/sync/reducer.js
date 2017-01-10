import update from 'react-addons-update';

import {
  REPLY_RECEIVED,
} from '_store/requests/actions';

import {
  GET_PLAY_LISTS,
} from '_store/playLists/actions';

import {
  START_SYNC,
  GET_HISTORY,
  CREATE_HISTORY,
  UPDATE_HISTORY,
  IMPORT_TRACKS,
  IMPORT_ALBUMS,
  IMPORT_ARTISTS,
  CLEAR_ALL,
  FIND_TRANSFER_PENDING,
  UPDATE_DOWNLOAD_STATUS,
  INCREMENT_PENDING,
} from './actions';

export default (
  state = {
    uuid: null,
    idDevice: null,
    hash: {},
    tracks: [],
    albums: [],
    artists: [],
    pending: [],
    i: 0,
  },
  action
) => {
  if (action.stage && action.stage !== REPLY_RECEIVED) return state;
  const payload = action.payload;
  const list = payload && payload.list;
  switch (action.type) {
    case START_SYNC:
      return update(state, {
        $merge: payload,
      });
    case GET_HISTORY: {
      return update(state, {
        hash: { $set: list.reduce(
          (playLists, playList) =>
            Object.assign({}, playLists, { [playList.idPlayList]: playList }),
          state.hash
        ) },
      });
    }
    case GET_PLAY_LISTS: {
      return update(state, {
        hash: { $set: list.reduce(
          (playLists, playList) =>
            Object.assign({}, playLists, { [playList.idPlayList]: playList }),
          state.hash
        ) },
      });
    }
    case UPDATE_HISTORY: {
      return update(state, {
        hash: {
          [payload.idPlayList]: {
            previousName: { $set: payload.name },
            previousIdTracks: { $set: payload.idTracks },
          },
        },
      });
    }
    case CREATE_HISTORY: {
      return update(state, {
        hash: {
          [payload.idPlayList]: {
            idPlayListHistory: { $set: payload.idPlayListHistory },
            previousName: { $set: payload.name },
            previousIdTracks: { $set: payload.idTracks },
          },
        },
      });
    }
    case IMPORT_TRACKS: {
      return update(state, {
        tracks: { $set: list },
      });
    }
    case IMPORT_ALBUMS: {
      return update(state, {
        albums: { $set: list },
      });
    }
    case IMPORT_ARTISTS: {
      return update(state, {
        artists: { $set: list },
      });
    }
    case CLEAR_ALL: {
      return update(state, {
        tracks: { $set: [] },
        albums: { $set: [] },
        artists: { $set: [] },
      });
    }
    case FIND_TRANSFER_PENDING:
      return update(state, {
        pending: { $set: list },
      });
    case UPDATE_DOWNLOAD_STATUS:
      return update(state, {
        pending: {
          [payload.i]: {
            status: { $set: payload.status },
          },
        },
      });
    case INCREMENT_PENDING:
      return update(state, {
        i: { $apply: i => i + 1 },
      });
    default:
      return state;
  }
};
