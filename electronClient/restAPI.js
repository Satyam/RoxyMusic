import { join } from 'path';
import ServerError from '_utils/serverError';
import dbg from 'debug';

// dbg.enable('RoxyMusic:restAPI');
const debug = dbg('RoxyMusic:restAPI');

const clients = {};

export default (base) => {
  if (clients[base]) return clients[base];
  let count = 0;
  /* eslint-disable import/no-extraneous-dependencies, global-require */
  const ipc = require('electron').ipcRenderer;
  /* eslint-enable import/no-extraneous-dependencies, global-require */
  const restClient = method => (path = '/', body) => new Promise((resolve, reject) => {
    const channel = `${base}-${count += 1}`;
    ipc.once(channel, (event, response) => {
      debug('< %s \n%j', channel, response.data);
      if (response.status < 300) {
        resolve(response.data);
      } else {
        reject(new ServerError(
          response.status,
          response.statusText,
          method,
          path
        ));
      }
    });
    debug('> %s %s %s \n%j',
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
};
