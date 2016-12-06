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

window.addEventListener('load', () => {
  const el = document.getElementById('log');
  function log(msg) {
    el.innerHTML = `${el.innerHTML}<pre>${msg}</pre>`;
    navigator.notification.alert(
      msg,  // message
      () => {},         // callback
      'Game Over',            // title
      'Done'                  // buttonName
    );
  }

  // log('comenzando');

  document.addEventListener(
    'deviceready',
    () => {
      if (!el) {
        alert('el not found');
        navigator.notification.alert(
          'el not found',  // message
          () => {},         // callback
          'Game Over',            // title
          'Done'                  // buttonName
        );
      }
      log('arranque');
      const DELDB = false;
      const musicDb = join(cordova.file.externalRootDirectory, 'Music/RoxyMusic.db');

      log(`musicdb: ${musicDb}`);
      (DELDB ? unlink(musicDb) : Promise.resolve())
      .then(() => openDatabase(musicDb))
      .then((rawDb) => {
        log('database opened');
        return new DB(rawDb);
      })
      .then(db =>
        db.get('select count(*) as c  from sqlite_master')
        .then((row) => {
          log(`red row ${JSON.stringify(row)}`);
          return (
            row.c === 0
            ? readFile(join(cordova.file.applicationDirectory, 'res/data.sql'), 'utf8')
              .then((data) => {
                log(`data read ${data.substr(0, 200)}`);
                return db.exec(data);
              })
              .then(() => db)
            : db
          );
        })
      )
      .then(db => dataServers(db, addRoute))
      .then(client)
      .catch((err) => {
        log(`catch: ${err}`);
      });
    },
    false
  );
});
