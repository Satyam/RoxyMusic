import update from 'react-addons-update';

import {
  REPLY_RECEIVED,
} from '_store/requests/actions';

import {
  GET_CONFIG,
  SET_CONFIG,
} from './actions';

export default (
  state = {},
  action
) => {
  const payload = action.payload;
  if (action.meta && action.meta.asyncAction !== REPLY_RECEIVED) return state;
  const originalPayload = action.meta && action.meta.originalPayload;
  switch (action.type) {
    case GET_CONFIG:
    case SET_CONFIG:
      return update(state, { [originalPayload.key]: { $set: payload } });
    default:
      return state;
  }
};
