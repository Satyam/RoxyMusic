import url from 'url';
import { join } from 'path';
import pathToRegexp from 'path-to-regexp';
import dbg from 'debug';
import ServerError from '_utils/serverError';

// dbg.enable('RoxyMusic:restAPI');
const debug = dbg('RoxyMusic:restAPI');

const clients = {};
const routes = [];

export function addRoute(method, route, actions) {
  const keys = [];
  const regexp = pathToRegexp(route, keys);
  routes.push({
    regexp,
    keys,
    method,
    actions: [].concat(actions),
  });
}

export default (base) => {
  if (clients[base]) return clients[base];
  const restClient = method => (reqUrl, data) => {
    const parsedUrl = url.parse(reqUrl, true);
    const path = join('/', base, parsedUrl.pathname || '');
    debug(`> ${method} ${path}`);
    const o = {
      options: parsedUrl.query,
      keys: {},
      data,
    };
    const route = routes.find((rt) => {
      if (method !== rt.method) return false;
      const m = rt.regexp.exec(path);
      if (!m) return false;
      for (let i = 1; i < m.length; i += 1) {
        const prop = rt.keys[i - 1].name;
        o.keys[prop] = m[i];
      }
      return true;
    });
    if (route) {
      return route.actions.reduce(
        (p, next) => p.then(next),
        Promise.resolve(o)
      )
      // .then((data) => {
      //   debug(`< ${method} ${path}, ${JSON.stringify(data)}`);
      //   return data;
      // })
      .catch((reason) => {
        debug(`<!!! ${method} ${path}, ${reason}`);
        return Promise.reject(new ServerError(
          reason.code || '',
          reason.message,
          method,
          path
        ));
      });
    }

    debug(`<!!! ${method} ${path}, no match found`);
    return Promise.reject(new ServerError(
      404,
      'no match found',
      method,
      path
    ));
  };
  return (clients[base] = {
    create: restClient('create'),
    read: restClient('read'),
    update: restClient('update'),
    delete: restClient('delete'),
  });
};
