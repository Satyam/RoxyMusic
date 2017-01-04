import { join } from 'path';
import ServerError from '_utils/serverError';
import dbg from 'debug';

const DEBUG = true;
if (DEBUG) dbg.enable('RoxyMusic:webClient/restAPI');
const debug = dbg('RoxyMusic:webClient/restAPI');

const clients = {};

export default (base, host = HOST, port = PORT) => {
  const key = join(host, port, base);
  if (clients[key]) return clients[key];
  const restClient = method => (path, body) => fetch(
    `${host}:${port}${join(REST_API_PATH, base, String(path))}`,
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
    : Promise.reject(new ServerError(
      response.status,
      response.statusText,
      method,
      join(base, String(path)
    )))
  ))
  .then(response => response.json())
  // ----- when debugging
  .then(
    (response) => {
      debug(`${method.toUpperCase()} ${join(base, String(path))}: ${JSON.stringify(response, null, 2)}`);
      return response;
    },
    (error) => {
      debug(`${method.toUpperCase()} ${join(base, String(path))}: ${JSON.stringify(error, null, 2)}`);
      return Promise.reject(error);
    }
  )
  // --
  ;
  return (clients[key] = {
    create: restClient('post'),
    read: restClient('get'),
    update: restClient('put'),
    delete: restClient('delete'),
  });
};
