import electron from 'electron';
import { join } from 'path';
import { Router as createRouter } from 'express';

import fs from 'fs';
import denodeify from 'denodeify';
import sqliteP from '_server/utils/sqliteP';

import music from '_server/music';
import serverIPC from './serverIPC';
import htmlTpl from './htmlTemplate';
import { initConfig, getConfig } from '_server/config';

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
  .then(initConfig)
  .then(() => Promise.all([
    music().then(router => dataRouter.use('/music', router)),
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
