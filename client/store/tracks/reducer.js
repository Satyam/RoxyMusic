import update from 'react-addons-update';

import {
  REPLY_RECEIVED,
} from '_store/requests/actions';

import {
  GET_ALBUM_TRACKS,
} from '_store/albums/actions';

import {
  GET_TRACK,
} from './actions';

const indexTracks = (payload, oldIndex = {}) => payload.reduce(
  (tracks, item) => Object.assign(tracks, { [item.idTrack]: item }),
  oldIndex
);

export default (
  state = {
    trackList: [],
    trackHash: {},
  },
  action
) => {
  const payload = action.payload;
  if (action.error) {
    if (action.type === GET_TRACK) {
      const idTrack = payload.originalPayload.idTrack;
      return update(state, { $merge: {
        [idTrack]: {
          idTrack,
          error: 404,
        },
      } });
    }
    return state;
  } else if (action.meta && action.meta.asyncAction !== REPLY_RECEIVED) return state;
  switch (action.type) {
    case GET_ALBUM_TRACKS:
      return update(state, {
        trackList: { $push: payload },
        trackHash: { $set: indexTracks(payload, state.trackHash) },
      });

    default:
      return state;
  }
};
