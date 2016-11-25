import { join } from 'path';
import debug from 'debug';

// debug.enable('RoxyMusic:restAPI');
const log = debug('RoxyMusic:restAPI');

const clients = {};

export default (base) => {
  if (clients[base]) return clients[base];
  let restClient;
  if (BUNDLE === 'electronClient') {
    let count = 0;
    /* eslint-disable import/no-extraneous-dependencies, global-require */
    const ipc = require('electron').ipcRenderer;
    /* eslint-enable import/no-extraneous-dependencies, global-require */
    restClient = method => (path, body) => new Promise((resolve, reject) => {
      const channel = `${base}-${count += 1}`;
      ipc.once(channel, (event, response) => {
        log('< %s \n%j', channel, response.data);
        if (response.status < 300) {
          resolve(response.data);
        } else {
          reject({
            status: response.status,
            statusText: response.statusText,
            message: `${method}: ${path} ${response.status} ${response.statusText}`,
          });
        }
      });
      log('> %s %s %s \n%j',
        channel,
        method,
        join(base, String(path)),
        body,
      );
      ipc.send('restAPI', {
        channel,
        url: join(base, String(path)),
        method,
        data: body,
      });
    });
    return (clients[base] = {
      create: restClient('create'),
      read: restClient('read'),
      update: restClient('update'),
      delete: restClient('delete'),
    });
  }
  // For the sake of uglifier, so it can drop it.
  if (BUNDLE !== 'electronClient') {
    restClient = method => (path, body) => fetch(
      `${HOST}:${PORT}${join(REST_API_PATH, base, String(path))}`,
      {
        method,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: body && JSON.stringify(body),
      }
    )
    .then(response => (
      response.ok
      ? response
      : Promise.reject({
        status: response.status,
        statusText: response.statusText,
        message: `${method}: ${response.url} ${response.status} ${response.statusText}`,
      })
    ))
    .then(response => response.json());
  }
  return (clients[base] = {
    create: restClient('post'),
    read: restClient('get'),
    update: restClient('put'),
    delete: restClient('delete'),
  });
};
