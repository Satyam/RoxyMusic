import { Router as createRouter } from 'express';
import { handleRequest } from '_server/utils/handleRequest';
import * as validators from '_server/utils/validators';

export function init() {
  return Promise.resolve();
}

// getTracks: 'select * from AllTracks where idTrack in ($idTracks)',
export function getTracks(o) {
  return db.all(`select * from AllTracks where idTrack in (${o.keys.idTracks})`);
}

export default () =>
  init()
  .then(() => createRouter()
    .get('/:idTracks', handleRequest(
      validators.idTracks,
      getTracks
    ))
  );
