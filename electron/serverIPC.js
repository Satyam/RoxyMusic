import electron from 'electron';
import url from 'url';
import debug from 'debug';
import pathToRegexp from 'path-to-regexp';

// debug.enable('RoxyMusic:serverIPC');
const log = debug('RoxyMusic:serverIPC');
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
  if (!routes.some((route) => {
    if (method !== route.method) return false;
    const m = route.regexp.exec(path);
    if (!m) return m;
    for (let i = 1; i < m.length; i += 1) {
      const prop = route.keys[i - 1].name;
      o.keys[prop] = m[i];
    }
    route.actions.reduce(
      (p, next) => p.then(next),
      Promise.resolve(o)
    )
    .then((data) => {
      log('< %s %j', msg.url, data);
      event.sender.send(msg.channel, {
        status: 200,
        data,
      });
    })
    .catch((reason) => {
      log('<!!! %s %j', msg.url, reason);
      event.sender.send(msg.channel, {
        status: (reason instanceof Error) ? 500 : reason.code,
        statusText: reason.message,
      });
    });
    return true;
  })) {
    log('<!!! %s %j', msg.url, 'no match found');
    event.sender.send(msg.channel, {
      status: 404,
      statusText: 'no match found',
    });
  }
});

export default (method, route, actions) => {
  const keys = [];
  routes.push({
    regexp: pathToRegexp(route, keys),
    keys,
    method,
    actions: [].concat(actions),
  });
};
