import {
  REPLY_RECEIVED,
} from '_store/requests/actions';


import {
  GET_TRACKS,
} from './actions';

export const trackSelectors = {};

function initSelectors(key) {
  trackSelectors.exists = (state, idTrack) => idTrack in state[key];
  trackSelectors.item = (state, idTrack) => state[key][idTrack] || {};
  trackSelectors.cachedTracks = state =>
    Object.keys(state[key]).map(id => parseInt(id, 10));
}

export default (
  state = {},
  action
) => {
  const payload = action.payload;
  const list = payload && payload.list;
  if (action.stage && action.stage !== REPLY_RECEIVED) return state;
  switch (action.type) {
    case GET_TRACKS: {
      const requested = payload.missing;
      const indexed = list.reduce(
        (hash, track) => Object.assign(hash, { [track.idTrack]: track }),
        {}
      );
      const missing = requested.filter(idTrack => !indexed[idTrack]);
      return Object.assign(state, indexed, missing.reduce(
        (hash, idTrack) => Object.assign(hash, { [idTrack]: { error: 404 } }),
        {}
      ));
    }
    case '@@selectors':
      initSelectors(action.key);
      return state;
    default:
      return state;
  }
};
