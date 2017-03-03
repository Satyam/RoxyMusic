import update from 'react-addons-update';
import unique from 'lodash/uniq';

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
  CLEAR_SIDE_BY_SIDE,
  FIND_MISSING_MP3S,
  UPDATE_DOWNLOAD_STATUS,
  INCREMENT_PENDING,
  CLEAR_MP3_TRANSFER,
  PILE_UP_TRACK_INFO,
} from './actions';


export function getSignature(pl) {
  return {
    signature: (
      pl && pl.name && pl.name.length
      ? `${pl.name}:${pl.idTracks.join(',')}`
      : null
    ),
    empty: pl.idTracks.length === 0,
  };
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

const SUB_STORE = 'sync';
export const syncSelectors = {
  catalogImportStage: state => state[SUB_STORE].catalogImportStage,
  sideBySideItem: (state, idPlayList) => state[SUB_STORE].hash[idPlayList],
  sideBySideHash: state => state[SUB_STORE].hash,
  isEmpty: state => Object.KEYs(state[SUB_STORE].hash).length === 0,
  mp3TransferPending: state => state[SUB_STORE].mp3TransferPending,
  idDevice: state => state[SUB_STORE].idDevice,
  musicDir: state => state[SUB_STORE].musicDir,
  idTracksForPlayList: (state, idPlayList) => {
    const pls = state[SUB_STORE].hash[idPlayList];
    return unique(pls.client.idTracks.concat(pls.server.idTracks));
  },
};

export default (
  state = {
    uuid: null,
    idDevice: null,
    musicDir: null,
    hash: {},
    catalogImportStage: 0,
    mp3TransferPending: {
      list: [],
      index: 0,
    },
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
    case GET_SERVER_PLAYLISTS: {
      // calculate signature
      // guess proper action and set it
      return update(state, {
        hash: {
          $set: list.reduce(
            (playLists, playList) => {
              const server = Object.assign(getSignature(playList), playList);
              const client = (
                playLists[playList.idPlayList]
                ? playLists[playList.idPlayList].client
                : {}
              );
              return Object.assign(
                {
                  [playList.idPlayList]: {
                    client,
                    server,
                    action: getAction(client, server),
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
              const client = Object.assign(getSignature(playList), playList);
              const server = (
                playLists[playList.idPlayList]
                ? playLists[playList.idPlayList].server
                : {}
              );
              return Object.assign(
                playLists,
                {
                  [playList.idPlayList]: {
                    client,
                    server,
                    action: getAction(client, server),
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
    case CLEAR_SIDE_BY_SIDE: {
      return update(state, {
        hash: { $set: {} },
        catalogImportStage: { $set: 10 } },
      );
    }
    case FIND_MISSING_MP3S:
      return update(state, {
        mp3TransferPending: { list: { $set: list } },
      });
    case UPDATE_DOWNLOAD_STATUS:
      return update(state, {
        mp3TransferPending: {
          list: {
            [payload.index]: {
              status: { $set: payload.status },
            },
          },
        },
      });
    case INCREMENT_PENDING:
      return update(state, {
        mp3TransferPending: { index: { $apply: i => i + 1 } },
      });
    case CLEAR_MP3_TRANSFER:
      return update(state, {
        mp3TransferPending: {
          $set: {
            list: [],
            index: 0,
          },
        },
      });
    case PILE_UP_TRACK_INFO: {
      return update(state, {
        hash: {
          [payload.idPlayList]: {
            tracks: {
              $apply: tracks => list.reduce(
                (ts, track) => (
                  track.error
                  ? ts
                  : Object.assign(ts, { [track.idTrack]: track })
                ),
                tracks || {}
              ),
            },
          },
        },
      });
    }
    default:
      return state;
  }
};
