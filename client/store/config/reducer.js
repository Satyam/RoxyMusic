import update from 'react-addons-update';

import {
  REPLY_RECEIVED,
} from '_store/requests/actions';

import {
  GET_CONFIG,
  GET_ALL_CONFIG,
  SET_CONFIG,
} from './actions';

const SUB_STORE = 'config';

export const configSelectors = {
  all: state => state[SUB_STORE],
  get: (state, name) => state[SUB_STORE][name],
};

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
    default:
      return state;
  }
};
