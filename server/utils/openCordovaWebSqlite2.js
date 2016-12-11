/* global window */
export default name =>
  new Promise((resolve, reject) => {
    if (window) {
      if (window.sqlitePlugin) {
        resolve(window.sqlitePlugin.openDatabase(name));
      } else reject('sqlitePlugin not found');
    } else reject('window not found');
  });
