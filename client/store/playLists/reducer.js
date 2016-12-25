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
  SELECT_PLAYLIST_FOR_TRACK,
  CLOSE_ADD_TO_PLAYLIST,
} from './actions';


export default (
  state = {
    loaded: false,
    hash: {},
    idTrackToAdd: null,
  },
  action
) => {
  if (action.meta && action.meta.asyncAction !== REPLY_RECEIVED) return state;
  const payload = action.payload;
  const original = action.meta && action.meta.originalPayload;
  const idPlayList = original && original.idPlayList;
  switch (action.type) {
    case GET_PLAY_LISTS:
      return update(state, {
        hash: { $set: payload.reduce(
          (playLists, playList) => Object.assign(playLists, { [playList.idPlayList]: playList }),
          state.hash,
        ) },
        loaded: { $set: true },
      });
    case GET_PLAY_LIST:
      return update(state, { hash: { $merge: { [idPlayList]: payload } } });
    case REPLACE_PLAY_LIST_TRACKS:
      return update(state, { hash: {
        [idPlayList]: {
          lastTrackPlayed: { $set: original.lastTrackPlayed },
          idTracks: { $set: original.idTracks },
        },
      } });
    case RENAME_PLAY_LIST:
      return update(state, { hash: {
        [idPlayList]: {
          name: { $set: original.name },
        },
      } });
    case ADD_PLAY_LIST:
      return update(state, { hash: {
        [payload.lastID]: { $set: {
          name: original.name,
          idPlayList: payload.idPlayList,
          idTracks: [],
        } },
      } });
    case DELETE_PLAY_LIST:
      return update(state, { hash: { $set: omit(state.hash, idPlayList) } });
    case SELECT_PLAYLIST_FOR_TRACK:
      return update(state, { idTrackToAdd: { $set: action.idTrack } });
    case CLOSE_ADD_TO_PLAYLIST:
      return update(state, { idTrackToAdd: { $set: null } });
    default:
      return state;
  }
};
