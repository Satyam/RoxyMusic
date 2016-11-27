import electron from 'electron';
import { join } from 'path';

import fs from 'fs';
import denodeify from 'denodeify';
import sqlP from '_server/utils/sqliteP';
import forEach from 'lodash/forEach';

import dataServers from '_server';

import IPC from './IPC';
import htmlTpl from './htmlTemplate';

const DELDB = false;

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;


const absPath = relative => join(ROOT_DIR, relative);

const writeFile = denodeify(fs.writeFile);
const unlink = denodeify(fs.unlink);

const htmlFile = absPath('electronServer/index.html');

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
        IPC(operation, join(prefix, route), actions)
      );
    });
  }

  (DELDB ? unlink('server/data.db') : Promise.resolve())
  .then(() => sqlP.open(absPath('server/data.db'), {
    initFileName: absPath('server/data.sql'),
    verbose: true,
  }))
  .then(db => dataServers(db, addToDataRouter))
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
