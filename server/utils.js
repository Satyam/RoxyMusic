import map from 'lodash/map';

export const failRequest = (code, message) => Promise.reject({ code, message });

export const handleRequest = (...args) => (req, res) => {
  const o = {
    keys: req.params || {},
    data: req.body,
    options: req.query || {},
  };

  const action = args[args.length - 1];
  Promise.all(args.slice(0, -1).map(validator => validator(o)))
  .then(() => action(o))
  .then(reply => res.json(reply))
  .catch((reason) => {
    res.status((reason instanceof Error) ? 500 : reason.code).send(reason.message);
  });
};

export function dolarizeQueryParams(...objs) {
  const params = {};
  objs.forEach(obj =>
    Object.keys(obj).forEach((key) => {
      params[`$${key}`] = obj[key];
    })
  );
  return params;
}

export function prepareAll(stmts) {
  const prepared = {};
  return Promise.all(map(stmts, (sql, name) =>
    db.prepare(sql)
    .then((stmt) => {
      prepared[name] = stmt;
    })
  ))
  .then(() => prepared);
}

const taken = {};

export function choke(resourceId, args) {
  return new Promise((resolve) => {
    const check = () => {
      if (taken[resourceId]) {
        global.setTimeout(check, 10);
      } else {
        taken[resourceId] = true;
        resolve(args);
      }
    };
    check();
  });
}

export function releaseChoke(resourceId, args) {
  taken[resourceId] = false;
  return args;
}
