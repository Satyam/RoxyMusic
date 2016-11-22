import http from 'http';
import { join } from 'path';
import express, { Router as createRouter } from 'express';
import bodyParser from 'body-parser';
import denodeify from 'denodeify';
import fs from 'fs';
import sqliteP from './utils/sqliteP';

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
  console.log(filename);
  res.sendFile(join(getConfig('musicDir'), filename));
});
app.get('/kill', (req, res) => {
  res.send('I am dead');
  close();
  process.exit();
});
app.get('*', (req, res) => res.sendFile(absPath('server/index.html')));

const DELDB = false;

export function start() {
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
    config().then(router => dataRouter.use('/config', router))
  )
  .then(() => Promise.all([
    albums().then(router => dataRouter.use('/albums', router)),
    playlists().then(router => dataRouter.use('/playLists', router)),
    artists().then(router => dataRouter.use('/artists', router)),
    songs().then(router => dataRouter.use('/songs', router)),
    tracks().then(router => dataRouter.use('/tracks', router)),
    refreshDb().then(router => dataRouter.use('/refreshDb', router)),
  ]))
  .then(() => listen(PORT));
}
export function stop() {
  return close();
}
