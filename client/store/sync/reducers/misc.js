import update from 'react-addons-update';

import {
  REPLY_RECEIVED,
} from '_store/requests/actions';

import {
  START_SYNC,
  GET_MISSING_TRACKS,
  IMPORT_TRACKS,
  SAVE_IMPORTED_TRACKS,
  GET_MISSING_ALBUMS,
  IMPORT_ALBUMS,
  SAVE_IMPORTED_ALBUMS,
  GET_MISSING_ARTISTS,
  IMPORT_ARTISTS,
  SAVE_IMPORTED_ARTISTS,
  CLEAR_SIDE_BY_SIDE,
} from '../actions';

const SUB_STORE = 'sync';
const SUB_STORE_1 = 'misc';
export const miscSelectors = {
  catalogImportStage: state => state[SUB_STORE][SUB_STORE_1].catalogImportStage,
  idDevice: state => state[SUB_STORE][SUB_STORE_1].idDevice,
  musicDir: state => state[SUB_STORE][SUB_STORE_1].musicDir,
};

export default (
  state = {
    uuid: null,
    idDevice: null,
    musicDir: null,
    catalogImportStage: 0,
  },
  action
) => {
  if (action.stage && action.stage !== REPLY_RECEIVED) return state;
  const payload = action.payload;
  switch (action.type) {
    case START_SYNC:
      return update(state, {
        $merge: payload,
      });
    case GET_MISSING_TRACKS:
      return update(state, { catalogImportStage: { $set: 1 } });
    case IMPORT_TRACKS:
      return update(state, { catalogImportStage: { $set: 2 } });
    case SAVE_IMPORTED_TRACKS:
      return update(state, { catalogImportStage: { $set: 3 } });
    case GET_MISSING_ALBUMS:
      return update(state, { catalogImportStage: { $set: 4 } });
    case IMPORT_ALBUMS:
      return update(state, { catalogImportStage: { $set: 5 } });
    case SAVE_IMPORTED_ALBUMS:
      return update(state, { catalogImportStage: { $set: 6 } });
    case GET_MISSING_ARTISTS:
      return update(state, { catalogImportStage: { $set: 7 } });
    case IMPORT_ARTISTS:
      return update(state, { catalogImportStage: { $set: 8 } });
    case SAVE_IMPORTED_ARTISTS:
      return update(state, { catalogImportStage: { $set: 9 } });
    case CLEAR_SIDE_BY_SIDE: {
      return update(state, {
        catalogImportStage: { $set: 10 } },
      );
    }
    default:
      return state;
  }
};
