import update from 'react-addons-update';
import pick from 'lodash/pick';

import {
  REPLY_RECEIVED,
} from '_store/requests/actions';

import {
  GET_ALBUM,
} from '_store/albums/actions';

export default (state = [], action) => {
  const payload = action.payload;
  if (action.error) {
    if (action.type === GET_ALBUM) {
      const idAlbum = payload.originalPayload.idAlbum;
      return update(state, { $merge: {
        [idAlbum]: {
          idAlbum,
          error: 404,
        },
      } });
    }
    return state;
  } else if (action.meta && action.meta.asyncAction !== REPLY_RECEIVED) return state;
  switch (action.type) {
    case GET_ALBUM:
      return update(state, { $merge: payload.reduce(
        (newTracks, track) => (
          track.idTrack in state
          ? newTracks
          : Object.assign(newTracks, { [track.idTrack]: pick(track, [
            'idTrack',
            'title',
            'idArtist',
            'idComposer',
            'idAlbumArtist',
            'idAlbum',
            'track',
            'date',
            'idGenre',
            'location',
            'fileModified',
            'size',
            'hasIssues',
          ]) })
        ),
        {}
      ) });
    default:
      return state;
  }
};
