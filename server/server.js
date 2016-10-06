import http from 'http';
import { join } from 'path';
import express, { Router as createRouter } from 'express';
import bodyParser from 'body-parser';
import denodeify from 'denodeify';
import sqliteP from './sqliteP';

// import isomorphic from '_server/isomorphic';

// import projects from './projects';

const absPath = relPath => join(ROOT_DIR, relPath);


const app = express();
const server = http.createServer(app);

const listen = denodeify(server.listen.bind(server));
const close = denodeify(server.close.bind(server));

const dataRouter = createRouter();
app.use(REST_API_PATH, bodyParser.json(), dataRouter);

app.use('/bootstrap', express.static(absPath('node_modules/bootstrap/dist')));
app.use(express.static(absPath('public')));

// app.use(isomorphic);

app.get('*', (req, res) => res.sendFile(absPath('server/index.html')));

export function start() {
  sqliteP.open(':memory:', { initFileName: absPath('server/data.sql') })
  .then((db) => {
    global.db = db;
  })
  .then(() => Promise.all([
    // projects().then(router => dataRouter.use('/projects', router)),
  ]))
  .then(() => listen(PORT));
}
export function stop() {
  return close();
}
