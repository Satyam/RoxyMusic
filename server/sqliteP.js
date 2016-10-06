import sqlite3 from 'sqlite3';
import fs from 'fs';
import denodeify from 'denodeify';
import debug from 'debug';

const log = debug('RoxyMusic:sqliteP');
const readFile = denodeify(fs.readFile);

export const OPEN_CREATE = sqlite3.OPEN_CREATE;
export const OPEN_READWRITE = sqlite3.OPEN_READWRITE;
export const OPEN_READONLY = sqlite3.OPEN_READONLY;

/**
 * Turn methods on `source` that return callbacks into methods on `dest` that are bound to
 * `source` as if invoked as method calls.
 *
 * @param source an object with methods named by `methods`.
 * @param dest an object upon which attributes will be set.
 * @param methods an array of method names.
 */
function denodeifyMethods(source, dest, methods) {
  methods.forEach((method) => {
    dest[method] = denodeify(source[method].bind(source));
  });
}

function strangeDenodeify(source, method) {
  return (...args) => new Promise((resolve, reject) => {
    let retValue;
    const callback = (err) => {
      if (err) reject(err);
      else resolve(retValue);
    };

    args.push(callback);
    retValue = source[method].apply(source, args);
  });
}


class ST {
  constructor(statement, options = {}) {
    this.statement = statement;
    this.options = options;
    denodeifyMethods(statement, this, ['reset', 'finalize', 'get', 'all']);
    this.bind = strangeDenodeify(statement, 'bind');
  }

  run(params) {
    return new Promise((resolve, reject) => {
      this.statement.run(params, (err) => {
        log(`Running: ${this.statement}, ${JSON.stringify(params)}`);

        if (err) {
          log(`SQL error: ${err} in ${this.statement}.`);
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }

  each(params, onRow) {
    return new Promise((resolve, reject) => {
      let done = false;

      const rowCallback = (err, row) => {
        if (done) return;

        if (err) {
          log(`SQL error in row function: ${err} in ${this.statement}.`);
          done = true;
          reject(err);
          return;
        }

        onRow(row);
      };

      const completionCallback = (err, count) => {
        if (err) {
          log(`SQL error in completion function: ${err} in ${this.statement}.`);
          reject(err);
          return;
        }

        resolve(count);
      };

      this.statement.each(params, rowCallback, completionCallback);
    });
  }
}

export class DB {
  constructor(db, options = {}) {
    this.db = db;
    this.options = options;
    denodeifyMethods(db, this, ['close', 'get', 'all', 'exec']);
    this.$prepare = strangeDenodeify(this.db, 'prepare');
  }

  prepare(sql, params) {
    return this.$prepare(sql, params)
      .then(statement => new ST(statement, this.options));
  }

  /**
   * Invokes the provided `onRow` callback with each result row.
   * Returns a promise that resolves to the number of returned rows.
   *
   * @param sql the query to run.
   * @param params any parameters to bind.
   * @param onRow a function of one argument, `(row)`.
   * @returns {Promise<int>} the number of returned rows.
   */
  each(sql, params, onRow) {
    return new Promise((resolve, reject) => {
      let done = false;

      const rowCallback = (err, row) => {
        if (done) return;

        if (err) {
          log(`SQL error in row function: ${err} in ${sql}.`);
          done = true;
          reject(err);
          return;
        }

        onRow(row);
      };

      const completionCallback = (err, count) => {
        if (err) {
          log(`SQL error in completion function: ${err} in ${sql}.`);
          reject(err);
          return;
        }

        resolve(count);
      };

      this.db.each(sql, params, rowCallback, completionCallback);
    });
  }

  run(sql, params) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, (err) => {
        log(`Running: ${sql}, ${JSON.stringify(params)}`);

        if (err) {
          log(`SQL error: ${err} in ${sql}.`);
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }

  /**
   * Begins a transaction and runs `f`. If `f` returns a promise that rejects,
   * rolls back the transaction and passes through the rejection. If `f` resolves
   * to a value, commits the transaction and passes through the resolved value.
   *
   * @param f the function to call within a transaction.
   * @returns {*} the result or rejection of `f`.
   */
  inTransaction(f) {
    return this
      .run('BEGIN TRANSACTION')
      .then(f)
      .then(result =>
        this
        .run('COMMIT')
        .then(() => Promise.resolve(result))
      )
      .catch(err =>
        this
        .run('ROLLBACK')
        .then(() => Promise.reject(err))
      );
  }

  /**
  Opens the database located in filename given with the given options.
  Returns a Promise that resolves to the open database.

  @param filename {string} the name of the database file to open.
  @param [options] {object} options
  @param options.mode one of the OPEN_xxx option flags, defaults to OPEN_CREATE + OPEN_READWRITE
  @param options.initSql {string} sql statements to initialize the database if found empty
  @param options.initFileName {string} name of a file containing the sql statements to initialize the database if found empty
  @param options.verbose {boolean} if truish, it opens the database in verbose mode.
  @returns {Promise} a Promise that resolves to the database instance
  */
  static open(filename, options) {
    return new Promise((resolve, reject) => {
      const sq = new (options.verbose ? sqlite3.verbose() : sqlite3).Database(
        filename,
        options.mode || (OPEN_CREATE + OPEN_READWRITE),
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(new DB(sq, options));
          }
        }
      );
    }).then((db) => {
      db.get('select count(*)  from sqlite_master')
      .then((row) => {
        if (row[0] === 0) {
          let src;
          if (options.initSql) {
            src = Promise.resolve(options.initSql);
          } else if (options.initFileName) {
            src = readFile(options.initFileName, 'utf8');
          }
          if (src) {
            return src.then(data => db.exec(data))
            .then(() => db);
          }
        }
        return db;
      });
    });
  }
}
