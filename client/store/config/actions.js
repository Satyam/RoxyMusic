import restAPI from '_platform/restAPI';
import asyncActionCreator from '_utils/asyncActionCreator';

const NAME = 'config';
const api = restAPI(NAME);

export const GET_CONFIG = `${NAME}/get config`;
export const GET_ALL_CONFIG = `${NAME}/get all config`;
export const SET_CONFIG = `${NAME}/set config`;

export function getConfig(key) {
  return asyncActionCreator(
    GET_CONFIG,
    api.read(key),
    { key }
  );
}

export function getAllConfig() {
  return asyncActionCreator(
    GET_ALL_CONFIG,
    api.read('/')
  );
}

export function setConfig(key, value) {
  return asyncActionCreator(
    SET_CONFIG,
    api.update(key, value),
    { key, value }
  );
}
