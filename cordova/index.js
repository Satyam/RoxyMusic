/* eslint-disable no-console */
import client from '_client';
import { join } from 'path';
import openDatabase from '_server/utils/openCordovaWebSqlEvcoreFullPath';
import DB from '_server/utils/webSqlP';

import dataServers from '_server';

import { addRoute } from './restAPI';


require('isomorphic-fetch');

if (process.env.NODE_ENV !== 'production') {
  /* eslint-disable import/no-extraneous-dependencies, global-require */
  global.Promise = require('bluebird');
  /* eslint-enable import/no-extraneous-dependencies, global-require */

  Promise.config({
    longStackTraces: true,
    warnings: true, // note, run node with --trace-warnings to see full stack traces for warnings
  });
}

const resolveLocalFileSystemURL = path => new Promise((resolve, reject) =>
  window.resolveLocalFileSystemURL(
    path,
    resolve,
    (err) => {
      reject(`resolveLocalFileSystemURL for ${path} returned ${err.message || err}`);
    }
  )
);
function readFile(path, encoding) {
  return resolveLocalFileSystemURL(path)
  .then(fileEntry => new Promise((resolve, reject) => {
    fileEntry.file(
      (file) => {
        const reader = new FileReader();

        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.onerror = (ev) => {
          reject(`readAsText for ${path} returned ${ev.message || ev}`);
        };
        reader.readAsText(file, encoding);
      },
      (err) => {
        reject(`readFile for ${path} returned ${err.message || err}`);
      }
    );
  }));
}

// export function alert(message, title, buttonName) {
//   return new Promise((resolve) => {
//     navigator.notification.alert(message, resolve, title, buttonName);
//   });
// }
// function unlink(path) {
//   return resolveLocalFileSystemURL(path)
//   .then(fileEntry => new Promise(fileEntry.remove));
// }

// export function folderPicker(startupPath) {
//   return new Promise((resolve, reject) => {
//     window.OurCodeWorld.Filebrowser.folderPicker.single({
//       success: folders => resolve(folders[0]),
//       error: reject,
//       startupPath,
//     });
//   });
// }


window.addEventListener('load', () => {
  document.addEventListener(
    'deviceready',
    () => {
      document.addEventListener('pause', () => {
        console.log('---Pausing ----');
      }, false);
      document.addEventListener('resume', () => {
        console.log('--- Resuming ---');
      }, false);

      const DELDB = true;
      const musicDb = join(cordova.file.dataDirectory || '/', 'RoxyMusic.db');

      console.log(`musicdb: ${musicDb}`);

      if (window.device) {
        console.log(`${window.device.model} : ${window.device.uuid}`);
      } else {
        console.log('no global device');
      }
      openDatabase(musicDb)
      .then((rawDb) => {
        console.log('database opened');
        return new DB(rawDb);
      })
      .then((db) => {
        function initDb() {
          return readFile(join(cordova.file.applicationDirectory, 'www/res/data.sql'), 'utf8')
            .then(data => db.exec(data))
            .then(() => db);
        }
        if (DELDB) return initDb();
        return db.get('select count(*) as c from config')
        .then(() => db)
        .catch((err1) => {
          console.log(`catch read on config ${err1.message || err1}`);
          return initDb();
        });
      })
      .then(db => dataServers(db, addRoute))

      .then(() => {
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS
        // https://github.github.io/fetch
        if (window.fetch) {
          return window.fetch(
            'http://192.168.0.101:8080/data/v2/config',
            {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              credentials: 'include',
            }
          )
          .then(response => response.text())
          .then(data => console.log(`fetch ${data}`))
          .catch(reason => console.log(`** fetch failed: ${reason}`));
        }
        return console.log('*** no fetch');
      })
      .then(client)
      .catch((err) => {
        console.log(`catch: ${err.message || err}`);
      });
    },
    false
  );
});
