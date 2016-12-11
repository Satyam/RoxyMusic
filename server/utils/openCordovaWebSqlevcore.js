/* global window, cordova */
export default filename =>
  new Promise((resolve, reject) => {
    if (window && window.sqlitePlugin) {
      resolve(window.sqlitePlugin.openDatabase(
        {
          name: filename,
          location: 'default',
        }
      ));
    } else reject('sqlitePlugin no found');
  });
