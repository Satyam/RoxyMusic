import update from 'react-addons-update';

import {
  REQUEST_SENT,
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
    stage: 0,
  },
  action
) => {
  const payload = action.payload;
  // const list = payload && payload.list;
  switch (action.stage) {
    case REQUEST_SENT:
      switch (action.type) {
        default:
          return state;
      }
    case REPLY_RECEIVED:
      switch (action.type) {
        case START_SYNC:
          return update(state, {
            $merge: payload,
            stage: { $set: 1 },
          });
        case GET_DIFFERENCES:
          return update(state, {
            $merge: payload,
            stage: { $set: 2 },
          });
        default:
          return state;
      }
    default:
      return state;
  }
};
