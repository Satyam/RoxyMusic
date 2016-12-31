import electron from 'electron';
import url from 'url';
import dbg from 'debug';
import pathToRegexp from 'path-to-regexp';

// dbg.enable('RoxyMusic:serverIPC');
const debug = dbg('RoxyMusic:serverIPC');
const routes = [];

electron.ipcMain.on('restAPI', (event, msg) => {
  const parsedUrl = url.parse(msg.url, true);
  const path = `/${parsedUrl.pathname}`;
  const method = msg.method;
  const o = {
    options: parsedUrl.query,
    keys: {},
    body: msg.data,
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
    route.actions.reduce(
      (p, next) => p.then(next),
      Promise.resolve(o)
    )
    .then((data) => {
      debug('< %s %j', msg.url, data);
      event.sender.send(msg.channel, {
        status: 200,
        data,
      });
    })
    .catch((reason) => {
      debug('<!!! %s %j', msg.url, reason);
      event.sender.send(msg.channel, {
        status: reason.code || 500,
        statusText: reason.message,
      });
    });
  } else {
    debug('<!!! %s %j', msg.url, 'no match found');
    event.sender.send(msg.channel, {
      status: 404,
      statusText: 'no match found',
    });
  }
});

export default (method, route, actions) => {
  const keys = [];
  const regexp = pathToRegexp(route, keys);
  routes.push({
    regexp,
    keys,
    method,
    actions: [].concat(actions),
  });
};
