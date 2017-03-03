import { combineReducers } from 'redux';

import misc, { miscSelectors } from './reducers/misc';
import sideBySide, { sideBySideSelectors } from './reducers/sideBySide';
import mp3Transfer, { mp3TransferSelectors } from './reducers/mp3Transfer';

export * from './actions';

export default combineReducers({
  misc,
  sideBySide,
  mp3Transfer,
});

export const syncSelectors = Object.assign({},
  miscSelectors,
  sideBySideSelectors,
  mp3TransferSelectors,
);
