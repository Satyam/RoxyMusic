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
  if (action.stage !== REPLY_RECEIVED) return state;
  switch (action.type) {
    case GET_CONFIG:
    case SET_CONFIG:
      return update(state, { [payload.key]: { $set: payload.value } });
    default:
      return state;
  }
};
