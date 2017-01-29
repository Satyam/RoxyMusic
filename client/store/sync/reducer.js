import update from 'react-addons-update';

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
  IMPORT_TRACKS,
  IMPORT_ALBUMS,
  IMPORT_ARTISTS,
  CLEAR_ALL,
  FIND_TRANSFER_PENDING,
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

export default (
  state = {
    uuid: null,
    idDevice: null,
    hash: {},
    tracks: [],
    albums: [],
    artists: [],
    pending: [],
    i: 0,
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
    case IMPORT_TRACKS: {
      return update(state, {
        tracks: { $set: list },
      });
    }
    case IMPORT_ALBUMS: {
      return update(state, {
        albums: { $set: list },
      });
    }
    case IMPORT_ARTISTS: {
      return update(state, {
        artists: { $set: list },
      });
    }
    case CLEAR_ALL: {
      return update(state, {
        tracks: { $set: [] },
        albums: { $set: [] },
        artists: { $set: [] },
      });
    }
    case FIND_TRANSFER_PENDING:
      return update(state, {
        pending: { $set: list },
      });
    case UPDATE_DOWNLOAD_STATUS:
      return update(state, {
        pending: {
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
