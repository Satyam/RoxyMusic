import update from 'react-addons-update';
import omit from 'lodash/omit';
import sortBy from 'lodash/sortBy';

import {
  REQUEST_SENT,
  REPLY_RECEIVED,
} from '_store/requests/actions';

import {
  GET_PLAY_LISTS,
  GET_PLAY_LIST,
  UPDATE_PLAYLIST,
  ADD_PLAY_LIST,
  DELETE_PLAY_LIST,
  SELECT_PLAYLIST_FOR_TRACK,
  CLOSE_ADD_TO_PLAYLIST,
} from './actions';

export const playListSelectors = {};

function initSelectors(key) {
  playListSelectors.loading = state => state[key].status !== 0;
  playListSelectors.isReady = state => state[key].status === 2;
  playListSelectors.item = (state, idPlayList) => state[key].hash[idPlayList] || {};
  playListSelectors.exists = (state, idPlayList) => idPlayList in state[key].hash;
  playListSelectors.all = state => state[key].hash;
  playListSelectors.tracksToAdd = state => state[key].idTracksToAdd;
  playListSelectors.orderedList = state =>
    sortBy(state[key].hash, playList => playList.name);
}

export default (
  state = {
    status: 0,
    hash: {},
    idTracksToAdd: null,
  },
  action
) => {
  if (action.type === GET_PLAY_LISTS && action.stage === REQUEST_SENT) {
    return update(state, { status: { $set: 1 } });
  }
  if (action.stage && action.stage !== REPLY_RECEIVED) return state;
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
        status: { $set: 2 },
      });
    case GET_PLAY_LIST:
      return update(state, { hash: { $merge: { [idPlayList]: payload } } });
    case UPDATE_PLAYLIST:
      return update(state, { hash: {
        [idPlayList]: {
          name: { $set: payload.name },
          idTracks: { $set: payload.idTracks },
        },
      } });
    case ADD_PLAY_LIST:
      return update(state, { hash: {
        [idPlayList]: { $set: {
          name: payload.name,
          idPlayList,
          idTracks: payload.idTracks || [],
          lastUpdated: payload.lastUpdated,
        } },
      } });
    case DELETE_PLAY_LIST:
      return update(state, { hash: { $set: omit(state.hash, idPlayList) } });
    case SELECT_PLAYLIST_FOR_TRACK:
      return update(state, { idTracksToAdd: { $set: action.idTracks } });
    case CLOSE_ADD_TO_PLAYLIST:
      return update(state, { idTracksToAdd: { $set: null } });
    case '@@selectors':
      initSelectors(action.key);
      return state;
    default:
      return state;
  }
};
