import sqlite3 from 'sqlite3';

export const OPEN_CREATE = sqlite3.OPEN_CREATE;
export const OPEN_READWRITE = sqlite3.OPEN_READWRITE;
export const OPEN_READONLY = sqlite3.OPEN_READONLY;
/**
Opens the database located in filename given with the given options.
Returns a Promise that resolves to the open database.

@param filename {string} the name of the database file to open.
@param [options] {object} options
@param options.mode one of the OPEN_xxx option flags, defaults to OPEN_CREATE + OPEN_READWRITE
@param options.verbose {boolean} if truish, it opens the database in verbose mode.
@returns {Promise} a Promise that resolves to the database instance
*/
export default (filename, options) =>
  new Promise((resolve, reject) => {
    const db = new (options.verbose ? sqlite3.verbose() : sqlite3).Database(
      filename,
      options.mode || (OPEN_CREATE + OPEN_READWRITE),
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(db);
        }
      }
    );
  });
