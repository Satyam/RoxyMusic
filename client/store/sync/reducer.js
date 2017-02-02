import update from 'react-addons-update';
import cloneDeep from 'lodash/cloneDeep';


import {
  REPLY_RECEIVED,
} from '_store/requests/actions';

import {
  START_SYNC,
  GET_SERVER_PLAYLISTS,
  GET_CLIENT_PLAYLISTS,
  TRANSFER_ACTION,
  SET_ACTION_FOR_SYNC,
  PLAYLIST_TRANSFER_DONE,
  GET_MISSING_TRACKS,
  IMPORT_TRACKS,
  SAVE_IMPORTED_TRACKS,
  GET_MISSING_ALBUMS,
  IMPORT_ALBUMS,
  SAVE_IMPORTED_ALBUMS,
  GET_MISSING_ARTISTS,
  IMPORT_ARTISTS,
  SAVE_IMPORTED_ARTISTS,
  CLEAR_ALL,
  FIND_MISSING_MP3S,
  UPDATE_DOWNLOAD_STATUS,
  INCREMENT_PENDING,
} from './actions';

export function getSignature(pl) {
  return (
    pl && pl.name && pl.name.length
    ? `${pl.name}:${pl.idTracks.join(',')}`
    : null
  );
}

export function getAction(client, server) {
  if (client.signature) {
    if (server.signature) {
      if (client.signature !== server.signature) {
        if (server.lastUpdated < client.lastUpdated) {
          return TRANSFER_ACTION.SEND;
        }
        return TRANSFER_ACTION.IMPORT;
      }  // else: they match, do nothing
    } else {
      return TRANSFER_ACTION.SEND;
    }
  } else if (server.signature) {
    return TRANSFER_ACTION.IMPORT;
  }
  return TRANSFER_ACTION.DO_NOTHING;
}

const initialState = {
  uuid: null,
  idDevice: null,
  hash: {},
  catalogImportStage: 0,
  mp3TransferPending: [],
  i: 0,
};

export default (
  state = cloneDeep(initialState),
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
    case GET_SERVER_PLAYLISTS: {
      // calculate signature
      // guess proper action and set it
      return update(state, {
        hash: {
          $set: list.reduce(
            (playLists, playList) => {
              const signature = getSignature(playList);
              const server = Object.assign({ signature }, playList);
              const client = (
                playLists[playList.idPlayList]
                ? playLists[playList.idPlayList].client
                : {}
              );
              const act = getAction(client, server);
              return Object.assign(
                {
                  [playList.idPlayList]: {
                    client,
                    server,
                    action: act,
                  },
                },
                playLists
              );
            },
            state.hash
          ),
        },
      });
    }

    case GET_CLIENT_PLAYLISTS: {
      return update(state, {
        hash: {
          $set: list.reduce(
            (playLists, playList) => {
              const signature = getSignature(playList);
              const client = Object.assign({ signature }, playList);
              const server = (
                playLists[playList.idPlayList]
                ? playLists[playList.idPlayList].server
                : {}
              );
              const act = getAction(client, server);
              return Object.assign(
                playLists,
                {
                  [playList.idPlayList]: {
                    client,
                    server,
                    action: act,
                  },
                }
              );
            },
            state.hash
          ),
        },
      });
    }
    case SET_ACTION_FOR_SYNC:
      return update(state, {
        hash: {
          [payload.idPlayList]: { action: { $set: payload.action } },
        },
      });
    case PLAYLIST_TRANSFER_DONE:
      return update(state, {
        hash: {
          [payload.idPlayList]: { done: { $set: true } },
        },
      });
    case GET_MISSING_TRACKS:
      return update(state, { catalogImportStage: { $set: 1 } });
    case IMPORT_TRACKS:
      return update(state, { catalogImportStage: { $set: 2 } });
    case SAVE_IMPORTED_TRACKS:
      return update(state, { catalogImportStage: { $set: 3 } });
    case GET_MISSING_ALBUMS:
      return update(state, { catalogImportStage: { $set: 4 } });
    case IMPORT_ALBUMS:
      return update(state, { catalogImportStage: { $set: 5 } });
    case SAVE_IMPORTED_ALBUMS:
      return update(state, { catalogImportStage: { $set: 6 } });
    case GET_MISSING_ARTISTS:
      return update(state, { catalogImportStage: { $set: 7 } });
    case IMPORT_ARTISTS:
      return update(state, { catalogImportStage: { $set: 8 } });
    case SAVE_IMPORTED_ARTISTS:
      return update(state, { catalogImportStage: { $set: 9 } });
    case CLEAR_ALL: {
      return Object.assign(cloneDeep(initialState), { catalogImportStage: 10 });
    }
    case FIND_MISSING_MP3S:
      return update(state, {
        mp3TransferPending: { $set: list },
      });
    case UPDATE_DOWNLOAD_STATUS:
      return update(state, {
        mp3TransferPending: {
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
