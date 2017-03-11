import restAPI from '_platform/restAPI';
import asyncActionCreator from '_utils/asyncActionCreator';

import { configSelectors } from './reducer';

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

let loadingRequest;

export function getAllConfig() {
  return (dispatch, getState) => {
    if (configSelectors.loaded(getState())) {
      return Promise.resolve();
    }
    if (!loadingRequest) {
      loadingRequest = dispatch(asyncActionCreator(
        GET_ALL_CONFIG,
        api.read('/')
      ))
      .then(() => {
        loadingRequest = null;
      });
    }
    return loadingRequest;
  };
}

export function setConfig(key, value) {
  return asyncActionCreator(
    SET_CONFIG,
    api.update(key, { value }),
    { key, value }
  );
}
