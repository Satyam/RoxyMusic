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
  DUPLICATE_PLAYLIST_FOR_TRACK,
  CLOSE_ADD_TO_PLAYLIST,
} from './actions';

const SUB_STORE = 'playLists';
export const playListSelectors = {
  loading: state => state[SUB_STORE].status !== 0,
  item: (state, idPlayList) => state[SUB_STORE].hash[idPlayList] || {},
  all: state => state[SUB_STORE].hash,
  tracksToAdd: state => state[SUB_STORE].idTracksToAdd,
  duplicatesToAdd: state => state[SUB_STORE].duplicatesToAdd,
  orderedList: state =>
    sortBy(state[SUB_STORE].hash, playList => playList.name.toLowerCase()),
};

export default (
  state = {
    status: 0,
    hash: {},
    idTracksToAdd: null,
    duplicatesToAdd: null,
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
          name: { $apply: name => (payload.name || name) },
          idTracks: { $apply: idTracks => (payload.idTracks || idTracks) },
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
    case DUPLICATE_PLAYLIST_FOR_TRACK:
      return update(state, { duplicatesToAdd: { $set: payload } });
    case CLOSE_ADD_TO_PLAYLIST:
      return update(state, {
        idTracksToAdd: { $set: null },
        duplicatesToAdd: { $set: null },
      });
    default:
      return state;
  }
};
