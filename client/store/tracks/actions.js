import restAPI from '_utils/restAPI';
import asyncActionCreator from '_utils/asyncActionCreator';

const api = restAPI('music/tracks');

export const GET_TRACK = 'tracks/get track';

export function getTrack(idTrack) {
  return asyncActionCreator(
    GET_TRACK,
    api.read(idTrack),
    { idTrack }
  );
}
