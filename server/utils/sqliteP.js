import sqlite3 from 'sqlite3';
import dbg from 'debug';
import map from 'lodash/map';

// dbg.enable('RoxyMusic:sqliteP');
const debug = dbg('RoxyMusic:sqliteP');

export const OPEN_CREATE = sqlite3.OPEN_CREATE;
export const OPEN_READWRITE = sqlite3.OPEN_READWRITE;
export const OPEN_READONLY = sqlite3.OPEN_READONLY;

function dolarizeQueryParams(obj) {
  const params = {};
  if (obj) {
    Object.keys(obj).forEach((key) => {
      params[`$${key}`] = obj[key];
    });
  }
  return params;
}

function myDenodeify(nodeStyleFunction, context, dolarize) {
  return (...functionArguments) => {
    const self = context || this;
    function promiseHandler(resolve, reject) {
      function callbackFunction(...args) {
        const error = args[0];

        if (error) {
          debug({
            sqlError: error,
            args: JSON.stringify(functionArguments),
            sql: context.sql,
          });
          return reject({
            sqlError: error,
            args: JSON.stringify(functionArguments),
            sql: context.sql,
          });
        }
        return resolve(args[1]);
      }
      if (dolarize) {
        /* eslint-disable no-param-reassign */
        functionArguments[dolarize - 1] = dolarizeQueryParams(functionArguments[dolarize - 1]);
        /* eslint-enable no-param-reassign */
      }
      functionArguments.push(callbackFunction);
      nodeStyleFunction.apply(self, functionArguments);
    }

    return new Promise(promiseHandler);
  };
}

/**
 * Turn methods on `source` that return callbacks into methods on `dest` that are bound to
 * `source` as if invoked as method calls.
 *
 * @param source an object with methods named by `methods`.
 * @param dest an object upon which attributes will be set.
 * @param methods an array of method names.
 */
function denodeifyMethods(source, dest, methods, dolarize) {
  methods.forEach((method) => {
    /* eslint-disable no-param-reassign */
    dest[method] = myDenodeify(source[method], source, dolarize);
    /* eslint-enable no-param-reassign */
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
    /* eslint-disable prefer-spread */
    retValue = source[method].apply(source, args);
    /* eslint-enable prefer-spread */
  });
}


class ST {
  constructor(statement, options = {}) {
    this.statement = statement;
    this.options = options;
    denodeifyMethods(statement, this, ['reset', 'finalize']);
    denodeifyMethods(statement, this, ['get', 'all'], 1);
    this.bind = strangeDenodeify(statement, 'bind');
  }

  run(params) {
    return new Promise((resolve, reject) => {
      /* eslint-disable func-names */
      // do not convert the following function callback into a fat arrow
      // because we need the `this` of that callback to extract info from it
      const self = this;
      this.statement.run(dolarizeQueryParams(params), function (err) {
        /* eslint-enable func-names */
        debug(`Running: ${self.statement.sql}, ${JSON.stringify(params, null, 2)}`);

        if (err) {
          debug(`SQL error: ${err} in ${self.statement.sql}.`);
          reject(`${self.statement.sql}
            ${JSON.stringify(params, null, 2)}
            ${err}`);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }

  each(params, onRow) {
    /* eslint-disable no-param-reassign */
    if (typeof params === 'function') {
      onRow = params;
      params = {};
    } else {
      params = dolarizeQueryParams(params);
    }
    /* eslint-enable no-param-reassign */

    return new Promise((resolve, reject) => {
      let done = false;

      const rowCallback = (err, row) => {
        if (done) return;

        if (err) {
          debug(`SQL error in row function: ${err} in ${this.statement.sql}, ${JSON.stringify(params, null, 2)}.`);
          done = true;
          reject(`${this.statement.sql}
            ${JSON.stringify(params, null, 2)}
            ${err}`);
          return;
        }

        onRow(row);
      };

      const completionCallback = (err, count) => {
        if (err) {
          debug(`SQL error in completion function: ${err} in ${this.statement}, ${JSON.stringify(params, null, 2)}.`);
          reject(err);
          return;
        }

        resolve(count);
      };

      this.statement.each(params, rowCallback, completionCallback);
    });
  }
}

export default class DB {
  constructor(db, options = {}) {
    this.db = db;
    this.options = options;
    denodeifyMethods(db, this, ['close', 'exec', 'serialize', 'parallelize']);
    denodeifyMethods(db, this, ['get', 'all'], 2);
    this.$prepare = strangeDenodeify(this.db, 'prepare');
  }

  prepare(sql, params) {
    return this.$prepare(sql, dolarizeQueryParams(params))
      .then(statement => new ST(statement, this.options));
  }

  prepareAll(stmts) {
    const prepared = {};
    return Promise.all(map(stmts, (sql, name) =>
      this.prepare(sql)
      .then((stmt) => {
        prepared[name] = stmt;
      })
    ))
    .then(() => prepared);
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
    /* eslint-disable no-param-reassign */
    if (typeof params === 'function') {
      onRow = params;
      params = {};
    } else {
      params = dolarizeQueryParams(params);
    }
    /* eslint-enable no-param-reassign */
    return new Promise((resolve, reject) => {
      let done = false;

      const rowCallback = (err, row) => {
        if (done) return;

        if (err) {
          debug(`SQL error in row function: ${err} in ${sql}, ${JSON.stringify(params, null, 2)}.`);
          done = true;
          reject(`${err} in ${sql}, ${JSON.stringify(params, null, 2)}.`);
          return;
        }

        onRow(row);
      };

      const completionCallback = (err, count) => {
        if (err) {
          debug(`SQL error in completion function: ${err} in ${sql}, ${JSON.stringify(params, null, 2)}.`);
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
      /* eslint-disable func-names */
      // do not convert the following function callback into a fat arrow
      // because we need the `this` of that callback to extract info from it
      this.db.run(sql, dolarizeQueryParams(params), function (err) {
        /* eslint-enable func-names */
        debug(`Running: ${sql}, ${JSON.stringify(params, null, 2)}`);

        if (err) {
          debug(`SQL error: ${err} in ${sql}, ${JSON.stringify(params, null, 2)}.`);
          reject(`${sql}
            ${JSON.stringify(params, null, 2)}
            ${err}`);
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
}
