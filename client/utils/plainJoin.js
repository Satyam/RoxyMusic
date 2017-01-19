const initial = /^\//;
const final = /\/$/;

export default (...paths) => {
  const last = paths.length - 1;
  return paths.map(
    (path, index) => {
      let p = String(path);
      if (index) p = p.replace(initial, '');
      if (index < last) p = p.replace(final, '');
      return p;
    }
  ).join('/');
};
