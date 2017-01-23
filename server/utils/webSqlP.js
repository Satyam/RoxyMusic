import map from 'lodash/map';

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
      lastID: result.insertId,
      changes: result.rowsAffected,
    }));
  }

  each(params, onRow) {
    if (typeof params === 'function') {
      /* eslint-disable no-param-reassign */
      onRow = params;
      params = undefined;
      /* eslint-enable no-param-reassign */
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
          (tx2, err) => {
            reject(`Error: ${JSON.stringify(err)} executing statement "${statement}", values ${paramValues}`);
          }
        ),
        (err) => {
          reject(`Error: ${JSON.stringify(err)} securing transaction for statement "${statement}", values ${paramValues}`);
        }
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

  close() {
    return new Promise((resolve, reject) => {
      if (typeof this.db.close === 'function') {
        this.db.close(
          resolve,
          err => reject(`db close returned error ${err.message || err}`)
        );
      } else resolve();
    });
  }
  exec(sql) {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          let lastIndex = 0;
          function solveOne() {
            const m = sqlSplitRE.exec(sql);
            if (m) {
              const s = sql.substring(lastIndex, m.index);
              lastIndex = m.index + 1;
              if (transactionRE.test(s)) {
                solveOne();
              } else {
                tx.executeSql(
                  s,
                  [],
                  solveOne,
                  (tx1, err) => {
                    reject(`Error: ${JSON.stringify(err)} executing statement "${s}`);
                  }
                );
              }
            }
          }
          solveOne();
        },
        (err) => {
          reject(`Error: ${JSON.stringify(err)} securing transaction for statement "${sql}"`);
        },
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
      /* eslint-disable no-param-reassign */
      onRow = params;
      params = undefined;
      /* eslint-enable no-param-reassign */
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

  /* eslint-disable class-methods-use-this */
  inTransaction(f) {
    return f();
  }
}
