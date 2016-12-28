import restAPI from '_platform/restAPI';
import remoteAPI from '_client/../webClient/restAPI';
import asyncActionCreator from '_utils/asyncActionCreator';

const NAME = 'sync';
const rApi = remoteAPI(NAME, 'http://192.168.0.101');
const api = restAPI(NAME);

const UUID = `${window.device.model} : ${window.device.uuid}`;

export const START_SYNC = `${NAME}/Start Synchronization`;
export const GET_DIFFERENCES = `${NAME}/get differences`;

export function startSync() {
  return asyncActionCreator(
    START_SYNC,
    rApi.read(`/myId/${UUID}`),
    { uuid: UUID }
  );
}

export function getDifferences(idDevice) {
  return asyncActionCreator(
    GET_DIFFERENCES,
    rApi.read(`/differences/${idDevice}`),
    { idDevice }
  );
}
