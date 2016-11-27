import electron from 'electron';
import { join } from 'path';

import fs from 'fs';
import denodeify from 'denodeify';
import sqliteP from '_server/utils/sqliteP';
import forEach from 'lodash/forEach';

import config from '_server/config';
import albums from '_server/albums';
import playlists from '_server/playlists';
import artists from '_server/artists';
import songs from '_server/songs';
import tracks from '_server/tracks';
import refreshDb from '_server/refreshDb';

import serverIPC from './serverIPC';
import htmlTpl from './htmlTemplate';

const DELDB = false;

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;


const absPath = relative => join(ROOT_DIR, relative);

const writeFile = denodeify(fs.writeFile);
const unlink = denodeify(fs.unlink);

const htmlFile = absPath('electron/index.html');

let mainWindow;

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', () => {
  mainWindow = new BrowserWindow();
  mainWindow.maximize();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  function addToDataRouter(prefix, routes) {
    forEach(routes, (operations, route) => {
      forEach(operations, (actions, operation) =>
        serverIPC(operation, join(prefix, route), actions)
      );
    });
  }

  (DELDB ? unlink('server/data.db') : Promise.resolve())
  .then(() => sqliteP.open(absPath('server/data.db'), {
    initFileName: absPath('server/data.sql'),
    verbose: true,
  }))
  .then(db =>
    // This one needs to be done before the rest
    config(db).then(routes => addToDataRouter('/config', routes))
    .then(() => Promise.all([
      albums(db).then(routes => addToDataRouter('/albums', routes)),
      playlists(db).then(routes => addToDataRouter('/playLists', routes)),
      artists(db).then(routes => addToDataRouter('/artists', routes)),
      songs(db).then(routes => addToDataRouter('/songs', routes)),
      tracks(db).then(routes => addToDataRouter('/tracks', routes)),
      refreshDb(db).then(routes => addToDataRouter('/refreshDb', routes)),
    ]))
  )
  .then(() =>
    writeFile(
      htmlFile,
      htmlTpl(absPath('bundles'), absPath('node_modules')),
    ),
  )
  .then(() => mainWindow.loadURL(`file://${htmlFile}`))
  // Un-comment the following to open the DevTools.
  .then(() => mainWindow.webContents.openDevTools({ mode: 'bottom' }))
  // ---------
  .catch((err) => {
    throw err;
  });
});
