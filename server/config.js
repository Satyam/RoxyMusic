let prepared = {};
const config = {};

const TEXT = 0;
const INTEGER = 1;
const NUMBER = 2;
const DATE = 3;
const BOOL = 4;
const OBJECT = 5;
const NULL = 6;

export function loadConfig() {
  return prepared.selectAllConfig.each((row) => {
    switch (row.type) {
      case INTEGER:
        config[row.key] = parseInt(row.value, 10);
        break;
      case NUMBER:
        config[row.key] = parseFloat(row.value);
        break;
      case DATE:
        config[row.key] = new Date(row.value);
        break;
      case BOOL:
        config[row.key] = row.value === 'true';
        break;
      case OBJECT:
        config[row.key] = JSON.parse(row.value);
        break;
      case NULL:
        config[row.key] = null;
        break;
      default: // TEXT
        config[row.key] = row.value;
        break;
    }
  });
}

export function getConfig(key) {
  return config[key];
}

export function setConfig(key, newValue) {
  if (config[key] === newValue) return newValue;
  let type = null;
  let value = null;
  switch (typeof newValue) {
    case 'boolean':
      type = BOOL;
      value = newValue ? 'true' : 'false';
      break;
    case 'number':
      value = String(newValue);
      type = value.indexOf('.') === -1 ? INTEGER : NUMBER;
      break;
    case 'string':
      type = TEXT;
      value = newValue;
      break;
    case 'object':
      if (newValue instanceof Date) {
        type = DATE;
        value = newValue.toISOString();
      } else if (newValue === null) {
        type = NULL;
        value = newValue;
      } else {
        type = OBJECT;
        value = JSON.stringify(newValue);
      }
      break;
    case 'undefined':
      delete config[key];
      return prepared.deleteConfig.run({ $key: key })
      .then(() => undefined);
    default: break;
  }
  if (type === null) {
    return Promise.reject(`setConfig: Invalid type for ${key}: ${newValue}`);
  }

  return prepared.updateConfigValue.run({ key, type, value })
  .then(() => {
    config[key] = newValue;
    return newValue;
  });
}

export function init(db) {
  return db.prepareAll({
    selectAllConfig: 'select * from config',
    selectConfigValue: 'select * from config where key=$key',
    updateConfigValue: 'replace into config (key, type, value) values ($key, $type, $value)',
    deleteConfig: 'delete from config where key=$key',
  })
  .then((p) => {
    prepared = p;
  })
  .then(() => loadConfig());
}

export default db =>
  init(db)
  .then(() => ({
    '/:key': {
      read: o => ({ value: getConfig(o.keys.key) }),
      create: o => setConfig(o.keys.key, o.data).then(value => ({ value })),
      update: o => setConfig(o.keys.key, o.data).then(value => ({ value })),
    },
    '/': {
      read: () => config,
    },
  }));
