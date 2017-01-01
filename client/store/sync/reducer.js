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
} from './actions';

export default (
  state = {
    uuid: null,
    idDevice: null,
    hash: {},
  },
  action
) => {
  if (action.stage !== REPLY_RECEIVED) return state;
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
            oldName: { $set: payload.name },
            oldIdTracks: { $set: payload.idTracks },
          },
        },
      });
    }
    case CREATE_HISTORY: {
      return update(state, {
        hash: {
          [payload.idPlayList]: {
            idPlayListHistory: { $set: payload.idPlayListHistory },
            oldName: { $set: payload.name },
            oldIdTracks: { $set: payload.idTracks },
          },
        },
      });
    }
    default:
      return state;
  }
};
