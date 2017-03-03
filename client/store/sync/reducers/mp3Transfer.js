import update from 'react-addons-update';

import {
  REPLY_RECEIVED,
} from '_store/requests/actions';

import {
  FIND_MISSING_MP3S,
  UPDATE_DOWNLOAD_STATUS,
  INCREMENT_PENDING,
  CLEAR_MP3_TRANSFER,
} from '../actions';

const SUB_STORE = 'sync';
const SUB_STORE_1 = 'mp3Transfer';
export const mp3TransferSelectors = {
  mp3TransferPending: state => state[SUB_STORE][SUB_STORE_1],
};
export default (
  state = {
    list: [],
    index: 0,
  },
  action
) => {
  if (action.stage && action.stage !== REPLY_RECEIVED) return state;
  const payload = action.payload;
  const list = payload && payload.list;
  switch (action.type) {
    case FIND_MISSING_MP3S:
      return update(state, { list: { $set: list } });
    case UPDATE_DOWNLOAD_STATUS:
      return update(state, {
        list: {
          [payload.index]: {
            status: { $set: payload.status },
          },
        },
      });
    case INCREMENT_PENDING:
      return update(state, { index: { $apply: i => i + 1 } });
    case CLEAR_MP3_TRANSFER:
      return update(state, {
        $set: {
          list: [],
          index: 0,
        },
      });
    default:
      return state;
  }
};
