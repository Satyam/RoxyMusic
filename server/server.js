import http from 'http';
import { join } from 'path';
import express, { Router as createRouter } from 'express';
import bodyParser from 'body-parser';
import denodeify from 'denodeify';
import fs from 'fs';
import sqliteP from './utils/sqliteP';

import music from './music';
import { initConfig, getConfig } from './config';

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
  .then(initConfig)
  .then(() => Promise.all([
    music().then(router => dataRouter.use('/music', router)),
  ]))
  .then(() => listen(PORT));
}
export function stop() {
  return close();
}
