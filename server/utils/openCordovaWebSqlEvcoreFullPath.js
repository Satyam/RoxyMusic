import path from 'path';

/* global window, cordova */
export default filename =>
  new Promise((resolve, reject) => {
    if (window && window.sqlitePlugin) {
      window.resolveLocalFileSystemURL(
        path.dirname(filename), // `${cordova.file.externalRootDirectory}/Music`,
        (externalDataDirectoryEntry) => {
          resolve(window.sqlitePlugin.openDatabase(
            {
              name: path.basename(filename),
              androidDatabaseLocation: externalDataDirectoryEntry.toURL(),
            }
          ));
        },
        reject
      );
    } else reject('sqlitePlugin no found');
  });
