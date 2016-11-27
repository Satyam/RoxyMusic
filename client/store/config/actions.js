import restAPI from '_platform/restAPI';
import asyncActionCreator from '_utils/asyncActionCreator';

const api = restAPI('config');

export const GET_CONFIG = 'config/get config';
export const SET_CONFIG = 'config/set config';

export function getConfig(key) {
  return asyncActionCreator(
    GET_CONFIG,
    api.read(key),
    { key }
  );
}

export function setConfig(key, value) {
  return asyncActionCreator(
    SET_CONFIG,
    api.update(key, value),
    { key, value }
  );
}
