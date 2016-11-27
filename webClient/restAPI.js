import { join } from 'path';

const clients = {};

export default (base) => {
  if (clients[base]) return clients[base];
  const restClient = method => (path, body) => fetch(
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
  return (clients[base] = {
    create: restClient('post'),
    read: restClient('get'),
    update: restClient('put'),
    delete: restClient('delete'),
  });
};
