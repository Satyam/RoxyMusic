import restAPI from '_platform/restAPI';
import asyncActionCreator from '_utils/asyncActionCreator';

const NAME = 'sync';
const api = restAPI(NAME);

const UUID = 'my fake uuid';

export const START_SYNC = `${NAME}/Start Synchronization`;
export const GET_DIFFERENCES = `${NAME}/get differences`;

export function startSync() {
  return asyncActionCreator(
    START_SYNC,
    api.read(`/myId/${UUID}`),
    { uuid: UUID }
  );
}

export function getDifferences() {
  return asyncActionCreator(
    GET_DIFFERENCES,
    api.read('/differences/2'),
    { idDevice: 2 }
  );
}
