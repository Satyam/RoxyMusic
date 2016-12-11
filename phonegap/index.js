import client from '_client';
// import { join } from 'path';
// import fs from 'fs';
import openDatabase from '_server/utils/openCordovaWebSqlevcore';
import DB from '_server/utils/webSqlP';

import dataServers from '_server';

import { addRoute } from './restAPI';

const resolveLocalFileSystemURL = path => new Promise((resolve, reject) =>
  window.resolveLocalFileSystemURL(
    path,
    resolve,
    (err) => {
      reject(`resolveLocalFileSystemURL for ${path} returned ${JSON.stringify(err)}`);
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
          reject(`readAsText for ${path} returned ${JSON.stringify(ev)}`);
        };
        reader.readAsText(file, encoding);
      },
      (err) => {
        reject(`readFile for ${path} returned ${JSON.stringify(err)}`);
      }
    );
  }));
}

// function unlink(path) {
//   return resolveLocalFileSystemURL(path)
//   .then(fileEntry => new Promise(fileEntry.remove));
// }


window.addEventListener('load', () => {
  const el = document.getElementById('log');
  function log(msg) {
    el.innerHTML = `${el.innerHTML}<pre>${msg}</pre>`;
    // navigator.notification.alert(
    //   msg,  // message
    //   () => {},         // callback
    //   'Game Over',            // title
    //   'Done'                  // buttonName
    // );
  }
  // const listDir = (key, path, howMany = 10) =>
  //   resolveLocalFileSystemURL(path)
  //   .then(dir => new Promise((resolve, reject) => {
  //     if (dir.createReader) {
  //       const directoryReader = dir.createReader();
  //       directoryReader.readEntries(
  //         (results) => {
  //           log(`For ${key}, path: ${path} found ${results.length} entries`);
  //           results.slice(0, howMany).forEach((fileEntry) => {
  //             log(`${key} ${fileEntry.isFile ? 'F' : 'D'}, path ${fileEntry.fullPath},
  //  ${fileEntry.toInternalURL()}`);
  //           });
  //           resolve(dir);
  //         },
  //         reject
  //       );
  //     } else {
  //       log(`${key} ${dir.name} does not have createReader`);
  //       reject(`${key} ${dir.name} does not have createReader`);
  //     }
  //   }))
  //   .catch((err) => {
  //     log(`Failed to resolve ${key}, ${path}, err: ${JSON.stringify(err)}`);
  //   });

  // log('comenzando');

  document.addEventListener(
    'deviceready',
    () => {
      if (!el) {
        navigator.notification.alert(
          'el not found',  // message
          () => {},         // callback
          'Game Over',            // title
          'Done'                  // buttonName
        );
      }
      log('arranque');
      const DELDB = false;
      // const musicDb = join(cordova.file.externalRootDirectory || '/', 'Music/RoxyMusic.db');
      //
      // log(`musicdb: ${musicDb}`);
      // if (fs && fs.init) {
      //   fs.init(null, (err, granted) => {
      //     if (err) {
      //       log(`fs.init error ${JSON.stringify(err)}`);
      //     } else {
      //       log(`Fs.init granted ${granted}`);
      //       if (fs.readdir) {
      //         fs.readdir(
      //           '/',
      //           (err1, files) => {
      //             if (err) {
      //               log(`fs.readdir error: ${JSON.stringify(err1)}`);
      //             } else {
      //               log(`fs.readdir found ${files.length} entries`);
      //               log(files.map(entry => entry.name).join(',\n'));
      //             }
      //           }
      //         );
      //       } else log(`fs or fs.readdir not found: ${typeof fs}, ${typeof fs.readdir}`);
      //     }
      //   });
      // }
      window.sqlitePlugin.echoTest(() => {
        log('sqlitePlugin ECHO test OK');
      });
      window.sqlitePlugin.selfTest(() => {
        log('sqlitePlugin SELF test OK');
      });
      openDatabase('RoxyMusic.db') // (musicDb))
      .then((rawDb) => {
        log('database opened');
        return new DB(rawDb);
      })
      .then((db) => {
        function initDb() {
          return readFile(`${cordova.file.applicationDirectory}/www/res/data.sql`, 'utf8')
            .then((data) => {
              log(`data read ${data.substr(0, 200)}`);
              return db.exec(data);
            })
            .then(() => db);
        }
        if (DELDB) return initDb();
        return db.get('select count(*) as c from config')
        .then(() => db)
        .catch((err1) => {
          log(`catch row ${JSON.stringify(err1)}`);
          return initDb();
        });
      })
      .then(db => dataServers(db, addRoute))
      .then(client)
      .catch((err) => {
        log(`catch: ${JSON.stringify(err)}`);
      });
    },
    false
  );
});
