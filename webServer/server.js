import http from 'http';
import { join, extname } from 'path';
import express, { Router as createRouter } from 'express';
import dbg from 'debug';

import bodyParser from 'body-parser';
import denodeify from 'denodeify';
import fs from 'fs';

import ffmpeg from 'fluent-ffmpeg';

import { getConfig } from '_server/config';
import dataServers from '_server';

import openDatabase from '_server/utils/openSqlite';
import DB from '_server/utils/sqliteP';

import uwa from './universalWebApp';

if (process.env.NODE_ENV !== 'production') {
  /* eslint-disable import/no-extraneous-dependencies, global-require */
  global.Promise = require('bluebird');
  /* eslint-enable import/no-extraneous-dependencies, global-require */

  Promise.config({
    longStackTraces: true,
    warnings: true, // note, run node with --trace-warnings to see full stack traces for warnings
  });
}

const absPath = relPath => join(ROOT_DIR, relPath);

const unlink = denodeify(fs.unlink);
const readFile = denodeify(fs.readFile);

const app = express();
const server = http.createServer(app);

const listen = denodeify(server.listen.bind(server));
const close = denodeify(server.close.bind(server));

// dbg.enable('RoxyMusic:server/server');
const debug = dbg('RoxyMusic:server/server');
// function showRequest(req, res, next) {
//   debug(`${req.method}: ${req.path}`);
//   next();
// }

let getLocationStatement;

const dataRouter = createRouter();
app.use(REST_API_PATH, bodyParser.json(), /* showRequest, */ dataRouter);

app.use('/bootstrap', express.static(absPath('node_modules/bootstrap/dist')));
app.use('/bundles', express.static(absPath('bundles')));
app.use(express.static(absPath('webServer/public')));

const musicRegExp = /^\/music\/(.+)$/;
app.get(musicRegExp, (req, res) => {
  const filename = decodeURI(musicRegExp.exec(req.path)[1]);
  debug('requested music file', filename);
  res.sendFile(join(getConfig('musicDir'), filename));
});

app.get('/tracks/:idTrack', (req, res) => {
  getLocationStatement.get({ idTrack: req.params.idTrack })
  .then((result) => {
    const audioExtensions = getConfig('portableAudioExtensions').split(',');
    const file = join(getConfig('musicDir'), result.location);
    const ext = extname(result.location);
    if (audioExtensions.indexOf(ext.substr(1)) > -1) {
      res.sendFile(file);
    } else {
      ffmpeg(file)
      .audioCodec('libmp3lame')
      .toFormat('mp3')
      .on('error', (err) => {
        console.log(`Error ${err.message} on ${result.location}`);
      })
      .pipe(res, { end: true });
    }
  });
});

app.get('/kill', (req, res) => {
  res.send('I am dead');
  close();
  process.exit();
});

app.use(uwa);

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
    res.status(reason.code || 500).send(reason.toString());
  });
};
const equivalent = {
  create: 'post',
  read: 'get',
  update: 'put',
  delete: 'delete',
};

function addRoute(operation, path, actions) {
  dataRouter[equivalent[operation]](path, handleRequest(actions));
}

export function start() {
  const DELDB = false;
  return (DELDB ? unlink('server/data.db') : Promise.resolve())
  .then(() => openDatabase(absPath('server/data.db'), {
    verbose: true,
  }))
  .then(rawDb => new DB(rawDb))
  .then(db =>
    db.get('select count(*) as c  from sqlite_master')
    .then(row => (
      row.c === 0
      ? readFile(absPath('server/data.sql'), 'utf8')
        .then(data => db.exec(data))
        .then(() => db)
      : db
    ))
  )
  .then((db) => {
    db.prepare('select location from Tracks where idTrack = $idTrack')
    .then((st) => {
      getLocationStatement = st;
    });
    return db;
  })
  .then(db => dataServers(db, addRoute))
  .then(() => listen(PORT));
}
export function stop() {
  return close();
}
