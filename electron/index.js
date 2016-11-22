import electron from 'electron';
import { join } from 'path';
import { Router as createRouter } from 'express';

import fs from 'fs';
import denodeify from 'denodeify';
import sqliteP from '_server/utils/sqliteP';

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

const dataRouter = createRouter();
serverIPC(dataRouter);

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

  (DELDB ? unlink('server/data.db') : Promise.resolve())
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
