import update from 'react-addons-update';

import {
  REPLY_RECEIVED,
} from '_store/requests/actions';

import {
  GET_PLAY_LISTS,
  IMPORT_PLAYLIST,
} from '_store/playLists/actions';

import {
  START_SYNC,
  GET_HISTORY,
  CREATE_HISTORY,
  UPDATE_HISTORY,
  IMPORT_TRACKS,
  IMPORT_ALBUMS,
  IMPORT_ARTISTS,
  SAVE_IMPORTED_TRACKS,
  SAVE_IMPORTED_ALBUMS,
  SAVE_IMPORTED_ARTISTS,
  UPDATE_ALBUM_ARTIST_MAP,
  CLEAR_ALL,
} from './actions';

export default (
  state = {
    uuid: null,
    idDevice: null,
    hash: {},
    stage: 0,
    tracks: [],
    albums: [],
    artists: [],
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
      return update(state, { stage: { $set: 3 } });
    }
    case UPDATE_HISTORY: {
      return update(state, {
        hash: {
          [payload.idPlayList]: {
            previousName: { $set: payload.name },
            previousIdTracks: { $set: payload.idTracks },
          },
        },
        stage: { $set: 4 },
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
        stage: { $set: 4 },
      });
    }
    case IMPORT_TRACKS: {
      return update(state, {
        tracks: { $set: list },
        stage: { $set: 5 },
      });
    }
    case IMPORT_ALBUMS: {
      return update(state, {
        albums: { $set: list },
        stage: { $set: 6 },
      });
    }
    case IMPORT_ARTISTS: {
      return update(state, {
        artists: { $set: list },
        stage: { $set: 7 },
      });
    }

    case SAVE_IMPORTED_TRACKS:
      return update(state, {
        stage: { $set: 8 },
      });
    case SAVE_IMPORTED_ALBUMS:
      return update(state, {
        stage: { $set: 9 },
      });
    case SAVE_IMPORTED_ARTISTS:
      return update(state, {
        stage: { $set: 10 },
      });
    case UPDATE_ALBUM_ARTIST_MAP:
      return update(state, {
        stage: { $set: 11 },
      });
    case CLEAR_ALL: {
      return update(state, {
        tracks: { $set: [] },
        albums: { $set: [] },
        artists: { $set: [] },
        stage: { $set: 12 },
      });
    }
    default:
      return state;
  }
};
