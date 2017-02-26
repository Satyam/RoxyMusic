import restAPI from '_platform/restAPI';
import asyncActionCreator from '_utils/asyncActionCreator';
import difference from 'lodash/difference';

import { trackSelectors } from '_store/selectors';

const api = restAPI('tracks');

export const GET_TRACKS = 'tracks/get tracks';

export function getTracks(idTracks) {
  return (dispatch, getState) => {
    const currentIds = trackSelectors.availableIdTracks(getState());
    const missing = difference(idTracks, currentIds);
    if (missing.length === 0) return Promise.resolve(null);
    return dispatch(asyncActionCreator(
      GET_TRACKS,
      api.read(missing),
      {
        requested: idTracks,
        missing,
      }
    ))
    ;
  };
}

export function getTrack(idTrack) {
  return getTracks([idTrack]);
}
