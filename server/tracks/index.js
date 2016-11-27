import * as validators from '_server/utils/validators';

let $db;
export function init(db) {
  $db = db;
  return Promise.resolve();
}

// getTracks: 'select * from AllTracks where idTrack in ($idTracks)',
export function getTracks(o) {
  return $db.all(`select * from AllTracks where idTrack in (${o.keys.idTracks})`);
}

export default db =>
  init(db)
  .then(() => ({
    '/:idTracks': {
      read: [
        validators.keyIsIntegerList('idTracks'),
        getTracks,
      ],
    },
  }));
