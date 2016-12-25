import restAPI from '_platform/restAPI';
import asyncActionCreator from '_utils/asyncActionCreator';
import difference from 'lodash/difference';

const api = restAPI('tracks');

export const GET_TRACKS = 'tracks/get tracks';

export function getTracks(idTracks) {
  return (dispatch, getState) => {
    const currentIds = Object.keys(getState().tracks).map(id => parseInt(id, 10));
    const missing = difference(idTracks, currentIds);
    if (missing.length === 0) return null;
    return asyncActionCreator(
      GET_TRACKS,
      api.read(missing),
      {
        requested: idTracks,
        missing,
      }
    )(dispatch);
  };
}

export function getTrack(idTrack) {
  return getTracks([idTrack]);
}
