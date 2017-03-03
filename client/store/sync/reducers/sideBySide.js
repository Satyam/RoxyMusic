import update from 'react-addons-update';
import unique from 'lodash/uniq';

import {
  REPLY_RECEIVED,
} from '_store/requests/actions';

import {
  GET_SERVER_PLAYLISTS,
  GET_CLIENT_PLAYLISTS,
  SET_ACTION_FOR_SYNC,
  PLAYLIST_TRANSFER_DONE,
  PILE_UP_TRACK_INFO,
  TRANSFER_ACTION,
  CLEAR_SIDE_BY_SIDE,
} from '../actions';

const SUB_STORE = 'sync';
const SUB_STORE_1 = 'sideBySide';
export const sideBySideSelectors = {
  sideBySideItem: (state, idPlayList) => state[SUB_STORE][SUB_STORE_1][idPlayList],
  sideBySideHash: state => state[SUB_STORE][SUB_STORE_1],
  isEmpty: state => Object.keys(state[SUB_STORE][SUB_STORE_1]).length === 0,
  idTracksForPlayList: (state, idPlayList) => {
    const pls = state[SUB_STORE][SUB_STORE_1][idPlayList];
    return unique(pls.client.idTracks.concat(pls.server.idTracks));
  },
};


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

export default (
  state = {},
  action
) => {
  if (action.stage && action.stage !== REPLY_RECEIVED) return state;
  const payload = action.payload;
  const list = payload && payload.list;
  switch (action.type) {
    case GET_SERVER_PLAYLISTS: {
      // calculate signature
      // guess proper action and set it
      return update(state, {
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
          state
        ),
      });
    }

    case GET_CLIENT_PLAYLISTS: {
      return update(state, {
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
          state
        ),
      });
    }
    case SET_ACTION_FOR_SYNC:
      return update(state, {
        [payload.idPlayList]: { action: { $set: payload.action } },
      });
    case PLAYLIST_TRANSFER_DONE:
      return update(state, {
        [payload.idPlayList]: { done: { $set: true } },
      });
    case PILE_UP_TRACK_INFO: {
      return update(state, {
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
      });
    }
    case CLEAR_SIDE_BY_SIDE: {
      return update(state, { $set: {} });
    }
    default:
      return state;
  }
};
