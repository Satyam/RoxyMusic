const initial = /^\//;
const final = /\/$/;

export default (...paths) =>
  paths.map(
    path => path.replace(initial, '').replace(final, '')
  ).join('/');
