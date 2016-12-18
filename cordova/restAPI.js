import url from 'url';
import { join } from 'path';
import pathToRegexp from 'path-to-regexp';

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
  const restClient = method => (reqUrl, body) => {
    const parsedUrl = url.parse(reqUrl, true);
    const path = join('/', base, parsedUrl.pathname || '');
    // console.log(`> ${method} ${path}`);
    const o = {
      options: parsedUrl.query,
      keys: {},
      body,
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
      //   console.log(`< ${method} ${path}, ${JSON.stringify(data)}`);
      //   return data;
      // })
      .catch((reason) => {
        // console.log(`<!!! ${method} ${path}, ${reason}`);
        return Promise.reject({
          status: (reason instanceof Error) ? 500 : reason.code,
          statusText: reason.message,
        });
      });
    }

    // console.log(`<!!! ${method} ${path}, no match found`);
    return {
      status: 404,
      statusText: 'no match found',
    };
  };
  return (clients[base] = {
    create: restClient('create'),
    read: restClient('read'),
    update: restClient('update'),
    delete: restClient('delete'),
  });
};
