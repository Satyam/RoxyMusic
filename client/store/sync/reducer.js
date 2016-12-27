import update from 'react-addons-update';

import {
  REPLY_RECEIVED,
} from '_store/requests/actions';

import {
  START_SYNC,
  GET_DIFFERENCES,
} from './actions';

export default (
  state = {
    uuid: null,
    idDevice: null,
    list: [],
  },
  action
) => {
  const payload = action.payload;
  // const list = payload && payload.list;

  if (action.stage !== REPLY_RECEIVED) return state;
  switch (action.type) {
    case START_SYNC:
      return update(state, { $merge: payload });
    case GET_DIFFERENCES:
      return update(state, { $merge: payload });
    default:
      return state;
  }
};
