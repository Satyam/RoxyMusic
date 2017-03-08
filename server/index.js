import forEach from 'lodash/forEach';
import { join } from 'path';

import albums from './albums';
import playlists from './playlists';
import artists from './artists';
import songs from './songs';
import tracks from './tracks';
import sync from './sync';

import config from './config';

export default function (db, routeAdd) {
  function addToDataRouter(prefix, routes) {
    forEach(routes, (operations, route) => {
      forEach(operations, (actions, operation) =>
        routeAdd(operation, join(prefix, route), actions)
      );
    });
  }
  // This one needs to be done before the rest
  return config(db).then(routes => addToDataRouter('/config', routes))
  .then(() => Promise.all([
    albums(db).then(routes => addToDataRouter('/albums', routes)),
    playlists(db).then(routes => addToDataRouter('/playLists', routes)),
    artists(db).then(routes => addToDataRouter('/artists', routes)),
    songs(db).then(routes => addToDataRouter('/songs', routes)),
    tracks(db).then(routes => addToDataRouter('/tracks', routes)),
    sync(db).then(routes => addToDataRouter('/sync', routes)),
  ]))
  .then(() => {
    if (BUNDLE !== 'cordova') {
      /* eslint-disable global-require */
      const refreshDb = require('./refreshDb').default;
      /* eslint-enable global-require */
      return refreshDb(db).then(routes => addToDataRouter('/refreshDb', routes));
    }
    return null;
  });
}
