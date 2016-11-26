import openDatabase from 'websql';
import fs from 'fs';
import denodeify from 'denodeify';
import map from 'lodash/map';

const readFile = denodeify(fs.readFile);

const paramsRE = /\$(\w+)/g;
const sqlSplitRE = /\s*;\s*(?=([^']*'[^']*')*[^']*$)/g;
const transactionRE = /^\s*((BEGIN)|(COMMIT)|(ROLLBACK))/i;

function findParams(sql) {
  let m;
  const params = [];
  /* eslint-disable no-cond-assign */
  while ((m = paramsRE.exec(sql))) {
    /* eslint-enable no-cond-assign */
    params.push(m[1]);
  }
  return params;
}

function replaceParams(sql) {
  return sql.replace(paramsRE, '?');
}

class ST {
  constructor(db, statement, options = {}) {
    this.db = db;
    this.statement = replaceParams(statement);
    this.params = findParams(statement);
    this.options = options;
  }

  get(params) {
    return this.db.process(this.statement, this.params, params)
    .then(result => result.rows.item(0));
  }
  all(params) {
    return this.db.process(this.statement, this.params, params)
    .then((result) => {
      let cursor = 0;
      const rows = [];
      let r;
      const rs = result.rows;
      /* eslint-disable no-cond-assign */
      while ((r = rs.item(cursor))) {
        cursor += 1;
        /* eslint-enable no-cond-assign */
        rows.push(r);
      }
      return rows;
    });
  }
  run(params) {
    return this.db.process(this.statement, this.params, params, true)
    .then(result => ({
      lastID: result.inserId,
      changes: result.rowsAffected,
    }));
  }

  each(params, onRow) {
    if (typeof params === 'function') {
      onRow = params;
      params = undefined;
    }
    return this.db.process(this.statement, this.params, params)
    .then((result) => {
      let cursor = 0;
      let r;
      const rs = result.rows;
      /* eslint-disable no-cond-assign */
      while ((r = rs.item(cursor))) {
        cursor += 1;
        /* eslint-enable no-cond-assign */
        onRow(r);
      }
    });
  }
}

export default class DB {
  constructor(db, options = {}) {
    this.db = db;
    this.options = options;
  }

  process(statement, params, paramValues, change) {
    return new Promise((resolve, reject) => {
      this.db[change ? 'transaction' : 'readTransaction'](
        tx => tx.executeSql(
          statement,
          params.map(name => paramValues[name]),
          (tx1, rs) => resolve(rs),
          reject
        ),
        reject
      );
    });
  }

  prepare(sql) {
    return Promise.resolve(new ST(this, sql, this.options));
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

  /* eslint-disable class-methods-use-this */
  close() {
    return Promise.resolve();
  }
  exec(sql) {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          let lastIndex = 0;
          function solveOne() {
            const m = sqlSplitRE(sql);
            if (m) {
              const s = sql.substring(lastIndex, m.index);
              if (transactionRE.text(s)) {
                solveOne();
              } else {
                tx.executeSql(
                  s,
                  [],
                  solveOne,
                  reject
                );
              }
              lastIndex = m.index + 1;
            }
          }
          solveOne();
        },
        reject,
        resolve
      );
    });
  }
  get(sql, params) {
    return this.process(replaceParams(sql), findParams(sql), params)
    .then(result => result.rows.item(0));
  }
  all(sql, params) {
    return this.process(replaceParams(sql), findParams(sql), params)
    .then((result) => {
      let cursor = 0;
      const rows = [];
      let r;
      const rs = result.rows;
      /* eslint-disable no-cond-assign */
      while ((r = rs.item(cursor))) {
        cursor += 1;
        /* eslint-enable no-cond-assign */
        rows.push(r);
      }
      return rows;
    });
  }

  each(sql, params, onRow) {
    if (typeof params === 'function') {
      onRow = params;
      params = undefined;
    }
    return this.process(replaceParams(sql), findParams(sql), params)
    .then((result) => {
      let cursor = 0;
      let r;
      const rs = result.rows;
      /* eslint-disable no-cond-assign */
      while ((r = rs.item(cursor))) {
        cursor += 1;
        /* eslint-enable no-cond-assign */
        onRow(r);
      }
    });
  }

  run(sql, params) {
    return this.process(replaceParams(sql), findParams(sql), params, true)
    .then(result => ({
      lastID: result.inserId,
      changes: result.rowsAffected,
    }));
  }

  inTransaction(f) {
    return f();
  }

  /**
  Opens the database located in filename given with the given options.
  Returns a Promise that resolves to the open database.

  @param filename {string} the name of the database file to open.
  @param [options] {object} options
  @param options.mode one of the OPEN_xxx option flags, defaults to OPEN_CREATE + OPEN_READWRITE
  @param options.initSql {string} sql statements to initialize the database if found empty
  @param options.initFileName {string} name of a file containing the sql statements
    to initialize the database if found empty
  @param options.verbose {boolean} if truish, it opens the database in verbose mode.
  @returns {Promise} a Promise that resolves to the database instance
  */
  static open(filename, options) {
    return new Promise(resolve =>
      openDatabase(
        filename,
        options.version || '1.0',
        options.description || 'description',
        options.size || 1,
        db => resolve(new DB(db, options))
      )
    ).then(db =>
      db.get('select count(*) as c  from sqlite_master')
      .then((row) => {
        if (row.c === 0) {
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
      })
    );
  }
}
