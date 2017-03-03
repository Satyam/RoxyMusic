import pick from 'lodash/pick';
import sortBy from 'lodash/sortBy';
import map from 'lodash/map';
import compact from 'lodash/compact';

import {
  REPLY_RECEIVED,
} from '_store/requests/actions';


import {
  GET_TRACKS,
} from './actions';


const SUB_STORE = 'tracks';
export const trackSelectors = {
  exists: (state, idTrack) => idTrack in state[SUB_STORE],
  item: (state, idTrack) => state[SUB_STORE][idTrack] || {},
  availableIdTracks: state =>
    compact(map(state[SUB_STORE], track => !track.error && track.idTrack)),
  idTracks: (state, idTracks, sorted) => {
    if (!sorted) return idTracks;
    return map(
      sortBy(
        pick(state[SUB_STORE], idTracks),
        track => track.title + track.album + track.track
      ),
      track => track.idTrack
    );
  },
};

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
    default:
      return state;
  }
};
