import openDatabase from 'websql';

export default (filename, options) => new Promise((resolve) => {
  openDatabase(
    filename,
    options.version || '1.0',
    options.description || 'description',
    options.size || 1,
    resolve
  );
});
