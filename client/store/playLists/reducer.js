import update from 'react-addons-update';
import omit from 'lodash/omit';

import {
  REPLY_RECEIVED,
} from '_store/requests/actions';

import {
  GET_PLAY_LISTS,
  GET_PLAY_LIST,
  REPLACE_PLAY_LIST_TRACKS,
  RENAME_PLAY_LIST,
  ADD_PLAY_LIST,
  DELETE_PLAY_LIST,
} from './actions';


export default (
  state = {},
  action
) => {
  if (action.meta && action.meta.asyncAction !== REPLY_RECEIVED) return state;
  const payload = action.payload;
  const original = action.meta && action.meta.originalPayload;
  const idPlayList = original && original.idPlayList;
  switch (action.type) {
    case GET_PLAY_LISTS:
      return payload.reduce(
        (playLists, playList) => Object.assign(playLists, { [playList.idPlayList]: playList }),
        state,
      );
    case GET_PLAY_LIST:
      return update(state, { $merge: { [idPlayList]: payload } });
    case REPLACE_PLAY_LIST_TRACKS:
      return update(state, {
        [idPlayList]: {
          lastPlayed: { $set: original.lastPlayed },
          idTracks: { $set: original.idTracks },
        },
      });
    case RENAME_PLAY_LIST:
      return update(state, {
        [idPlayList]: {
          name: { $set: original.name },
        },
      });
    case ADD_PLAY_LIST:
      return update(state, {
        [payload.lastID]: { $set: {
          name: original.name,
          idPlayList: payload.lastID,
        } },
      });
    case DELETE_PLAY_LIST:
      return omit(state, idPlayList);
    default:
      return state;
  }
};
