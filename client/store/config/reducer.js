import update from 'react-addons-update';

import {
  REPLY_RECEIVED,
} from '_store/requests/actions';

import {
  GET_CONFIG,
  GET_ALL_CONFIG,
  SET_CONFIG,
} from './actions';

export const configSelectors = {};

function initSelectors(key) {
  configSelectors.all = state => state[key];
  configSelectors.get = (state, name) => state[key][name];
}

export default (
  state = {},
  action
) => {
  const payload = action.payload;
  if (action.stage && action.stage !== REPLY_RECEIVED) return state;
  switch (action.type) {
    case GET_ALL_CONFIG:
      return payload;
    case GET_CONFIG:
    case SET_CONFIG:
      return update(state, { [payload.key]: { $set: payload.value } });
    case '@@selectors':
      initSelectors(action.key);
      return state;
    default:
      return state;
  }
};
