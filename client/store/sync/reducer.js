import update from 'react-addons-update';

import {
  REQUEST_SENT,
  REPLY_RECEIVED,
} from '_store/requests/actions';

import {
  GET_PLAY_LISTS,
} from '_store/playLists/actions';

import {
  START_SYNC,
  GET_HISTORY,
  IMPORT_PLAYLIST,
  CREATE_HISTORY,
  UPDATE_HISTORY,
} from './actions';

export default (
  state = {
    uuid: null,
    idDevice: null,
    hash: {},
    stage: 0,
  },
  action
) => {
  const payload = action.payload;
  const list = payload && payload.list;
  switch (action.stage) {
    case REQUEST_SENT:
      switch (action.type) {
        default:
          return state;
      }
    case REPLY_RECEIVED:
      switch (action.type) {
        case START_SYNC:
          return update(state, {
            $merge: payload,
            stage: { $set: 1 },
          });
        case GET_HISTORY: {
          return update(state, {
            hash: { $set: list.reduce(
              (playLists, playList) =>
                Object.assign({}, playLists, { [playList.idPlayList]: playList }),
              state.hash
            ) },
            stage: { $set: 2 },
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
        case IMPORT_PLAYLIST: {
          console.log('IMPORT_PLAYLIST', payload, state);
          return state;
        }
        case UPDATE_HISTORY: {
          console.log('UPDATE_HISTORY', payload, state);
          return state;
        }
        case CREATE_HISTORY: {
          console.log('CREATE_HISTORY', payload, state);
          return state;
        }
        default:
          return state;
      }
    default:
      return state;
  }
};
