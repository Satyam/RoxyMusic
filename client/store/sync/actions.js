// import restAPI from '_platform/restAPI';
import remoteAPI from '_client/../webClient/restAPI';
import asyncActionCreator from '_utils/asyncActionCreator';

import {
  IMPORT_PLAYLIST,
} from '_store/actions';

const NAME = 'sync';
const rApi = remoteAPI(NAME, 'http://192.168.0.101');
// const api = restAPI(NAME);

const UUID = window.device && `${window.device.model} : ${window.device.uuid}`;

export const START_SYNC = `${NAME}/Start Synchronization`;
export const GET_HISTORY = `${NAME}/get history`;
export const CREATE_HISTORY = `${NAME}/create history`;
export const UPDATE_HISTORY = `${NAME}/update history`;

export function startSync() {
  return asyncActionCreator(
    START_SYNC,
    rApi.read(`/myId/${UUID}`),
    { uuid: UUID }
  );
}

export function getHistory(idDevice) {
  return asyncActionCreator(
    GET_HISTORY,
    rApi.read(`/history/${idDevice}`),
    { idDevice }
  );
}

export function importPlayList(idPlayList) {
  return asyncActionCreator(
    IMPORT_PLAYLIST,
    rApi.read(`/playlist/${idPlayList}`),
    { idPlayList }
  );
}

export function updateHistory(idPlayListHistory, name, idTracks) {
  return asyncActionCreator(
    UPDATE_HISTORY,
    rApi.update(`/history/${idPlayListHistory}`, { name, idTracks }),
    { name, idTracks }
  );
}

export function createHistory(idDevice, idPlayList, name, idTracks) {
  return asyncActionCreator(
    CREATE_HISTORY,
    rApi.create(`/history/${idDevice}`, { name, idTracks, idPlayList }),
    { name, idTracks, idPlayList }
  );
}
