import http from 'http';
import { join } from 'path';
import express, { Router as createRouter } from 'express';
import bodyParser from 'body-parser';
import denodeify from 'denodeify';
import fs from 'fs';
import forEach from 'lodash/forEach';

import sqliteP from './utils/sqliteP';
import handleRequest from './utils/handleRequest';

import albums from './albums';
import playlists from './playlists';
import artists from './artists';
import songs from './songs';
import tracks from './tracks';
import refreshDb from './refreshDb';

import config, { getConfig } from './config';

const absPath = relPath => join(ROOT_DIR, relPath);

const unlink = denodeify(fs.unlink);

const app = express();
const server = http.createServer(app);

const listen = denodeify(server.listen.bind(server));
const close = denodeify(server.close.bind(server));

const dataRouter = createRouter();
app.use(REST_API_PATH, bodyParser.json(), dataRouter);

app.use('/bootstrap', express.static(absPath('node_modules/bootstrap/dist')));
app.use(express.static(absPath('public')));
const musicRegExp = /^\/music\/(.+)$/;
app.get(musicRegExp, (req, res) => {
  const filename = decodeURI(musicRegExp.exec(req.path)[1]);
  console.log('requested music file', filename);
  res.sendFile(join(getConfig('musicDir'), filename));
});
app.get('/kill', (req, res) => {
  res.send('I am dead');
  close();
  process.exit();
});
app.get('*', (req, res) => res.sendFile(absPath('server/index.html')));

const equivalent = {
  create: 'post',
  read: 'get',
  update: 'put',
  delete: 'delete',
};

function addToDataRouter(prefix, routes) {
  forEach(routes, (operations, route) => {
    forEach(operations, (actions, operation) => {
      const method = equivalent[operation];
      dataRouter[method](join(prefix, route), handleRequest(actions));
    });
  });
}
export function start() {
  const DELDB = false;
  return (DELDB ? unlink('server/data.db') : Promise.resolve())
  .then(() => sqliteP.open(absPath('server/data.db'), {
    initFileName: absPath('server/data.sql'),
    verbose: true,
  }))
  .then((db) => {
    global.db = db;
  })
  .then(() =>
    // This one needs to be done before the rest
    config().then(routes => addToDataRouter('/config', routes))
  )
  .then(() => Promise.all([
    albums().then(routes => addToDataRouter('/albums', routes)),
    playlists().then(routes => addToDataRouter('/playLists', routes)),
    artists().then(routes => addToDataRouter('/artists', routes)),
    songs().then(routes => addToDataRouter('/songs', routes)),
    tracks().then(routes => addToDataRouter('/tracks', routes)),
    refreshDb().then(routes => addToDataRouter('/refreshDb', routes)),
  ]))
  .then(() => listen(PORT));
}
export function stop() {
  return close();
}
