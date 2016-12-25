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
  if (action.stage !== REPLY_RECEIVED) return state;
  const payload = action.payload;
  const list = payload && payload.list;
  const idPlayList = payload && payload.idPlayList;
  switch (action.type) {
    case GET_PLAY_LISTS:
      return update(state, {
        hash: { $set: list.reduce(
          (playLists, playList) => Object.assign(playLists, { [playList.idPlayList]: playList }),
          state.hash,
        ) },
        loaded: { $set: true },
      });
    case GET_PLAY_LIST:
      return update(state, { hash: { $merge: { [idPlayList]: list } } });
    case REPLACE_PLAY_LIST_TRACKS:
      return update(state, { hash: {
        [idPlayList]: {
          lastTrackPlayed: { $set: payload.lastTrackPlayed },
          idTracks: { $set: payload.idTracks },
        },
      } });
    case RENAME_PLAY_LIST:
      return update(state, { hash: {
        [idPlayList]: {
          name: { $set: payload.name },
        },
      } });
    case ADD_PLAY_LIST:
      return update(state, { hash: {
        [idPlayList]: { $set: {
          name: payload.name,
          idPlayList,
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
