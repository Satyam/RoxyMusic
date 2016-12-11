/* global window */
export default name =>
  new Promise((resolve, reject) => {
    if (window) {
      if (window.openDatabase) {
        resolve(window.openDatabase(name, '1.0', name, 1));
      } else reject('window.openDatabase not found');
    } else reject('window not found');
  });
