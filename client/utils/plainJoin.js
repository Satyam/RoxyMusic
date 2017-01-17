const initial = /^\//;
const final = /\/$/;

export default (...paths) =>
  paths.map(
    path => String(path).replace(initial, '').replace(final, '')
  ).join('/');
