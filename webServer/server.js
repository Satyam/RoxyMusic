import http from 'http';
import { join } from 'path';
import express, { Router as createRouter } from 'express';
import dbg from 'debug';

import bodyParser from 'body-parser';
import denodeify from 'denodeify';
import fs from 'fs';
import forEach from 'lodash/forEach';

import { getConfig } from '_server/config';
import dataServers from '_server';

import sqlP from '_server/utils/webSqlP';

const absPath = relPath => join(ROOT_DIR, relPath);

const unlink = denodeify(fs.unlink);

const app = express();
const server = http.createServer(app);

const listen = denodeify(server.listen.bind(server));
const close = denodeify(server.close.bind(server));

// dbg.enable('RoxyMusic:server/server');
const debug = dbg('RoxyMusic:server/server');

const dataRouter = createRouter();
app.use(REST_API_PATH, bodyParser.json(), dataRouter);

app.use('/bootstrap', express.static(absPath('node_modules/bootstrap/dist')));
app.use('/bundles', express.static(absPath('bundles')));
app.use(express.static(absPath('webServer/public')));

const musicRegExp = /^\/music\/(.+)$/;
app.get(musicRegExp, (req, res) => {
  const filename = decodeURI(musicRegExp.exec(req.path)[1]);
  debug('requested music file', filename);
  res.sendFile(join(getConfig('musicDir'), filename));
});
app.get('/kill', (req, res) => {
  res.send('I am dead');
  close();
  process.exit();
});
app.get('*', (req, res) => res.sendFile(absPath('webServer/index.html')));

const handleRequest = actions => (req, res) => {
  const o = {
    keys: req.params || {},
    data: req.body,
    options: req.query || {},
  };

  debug('> %s %s %j', req.method, req.url, o);
  return [].concat(actions).reduce(
    (p, next) => p.then(next),
    Promise.resolve(o)
  )
  .then((reply) => {
    debug('< %s %s %j', req.method, req.url, reply);
    return res.json(reply);
  })
  .catch((reason) => {
    res.status((reason instanceof Error) ? 500 : reason.code).send(reason.message);
  });
};
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
  .then(() => sqlP.open(absPath('server/data.db'), {
    initFileName: absPath('server/data.sql'),
    verbose: true,
  }))
  .then(db => dataServers(db, addToDataRouter))
  .then(() => listen(PORT));
}
export function stop() {
  return close();
}
