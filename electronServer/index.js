import electron from 'electron';
import { join } from 'path';

import fs from 'fs';
import denodeify from 'denodeify';

import openDatabase from '_server/utils/openSqlite';
import DB from '_server/utils/sqliteP';

import dataServers from '_server';

import IPC from './IPC';
import htmlTpl from './htmlTemplate';

const DELDB = false;

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;


const absPath = relative => join(ROOT_DIR, relative);

const writeFile = denodeify(fs.writeFile);
const unlink = denodeify(fs.unlink);
const readFile = denodeify(fs.readFile);

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

  (DELDB ? unlink('server/data.db') : Promise.resolve())
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
  .then(db => dataServers(db, IPC))
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
