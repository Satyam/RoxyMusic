/* global window, cordova */
import client from '_client';
import { join } from 'path';

import fs from 'fs';
import denodeify from 'denodeify';
import openDatabase from '_server/utils/openCordovaWebSql';
import DB from '_server/utils/webSqlP';

import dataServers from '_server';

import { addRoute } from './restAPI';

const unlink = denodeify(fs.unlink);
const readFile = denodeify(fs.readFile);

window.document.addEventListener(
  'deviceready',
  () => {
    const DELDB = false;
    const musicDb = join(cordova.file.externalRootDirectory, 'Music/RoxyMusic.db');

    (DELDB ? unlink(musicDb) : Promise.resolve())
    .then(() => openDatabase(musicDb))
    .then(rawDb => new DB(rawDb))
    .then(db =>
      db.get('select count(*) as c  from sqlite_master')
      .then(row => (
        row.c === 0
        ? readFile(join(cordova.file.applicationDirectory, 'res/data.sql'), 'utf8')
          .then(data => db.exec(data))
          .then(() => db)
        : db
      ))
    )
    .then(db => dataServers(db, addRoute))
    .then(client)
    .catch((err) => {
      window.document.getElementById('contents').innerHTML = err;
    });
  },
  false
);
