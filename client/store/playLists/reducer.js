import update from 'react-addons-update';

import {
  REPLY_RECEIVED,
} from '_store/requests/actions';

import {
  GET_PLAY_LISTS,
  GET_PLAY_LIST,
} from './actions';


export default (
  state = [],
  action
) => {
  if (action.meta && action.meta.asyncAction !== REPLY_RECEIVED) return state;
  switch (action.type) {
    case GET_PLAY_LISTS:
      return action.payload.concat();
    case GET_PLAY_LIST:
      return update(state, {
        [action.meta.originalPayload.idPlayList]: {
          idTracks: {
            $set: action.payload,
          },
        },
      });
    default:
      return state;
  }
};
