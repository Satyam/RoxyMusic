import { dolarizeQueryParams, prepareAll } from '_server/utils';

import initRefresh, { startRefresh, refreshStatus, stopRefresh } from './refreshDb';

let prepared = {};
const config = {};

const TEXT = 0;
const INTEGER = 1;
const NUMBER = 2;
const DATE = 3;
const BOOL = 4;
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
      default:
        config[row.key] = row.value;
        break;
    }
  });
}

export function init() {
  return prepareAll({
    selectAllConfig: 'select * from config',
    selectConfigValue: 'select * from config where key=$key',
    updateConfigValue: 'replace into config (key, type, value) values ($key, $type, $value)',
  })
  .then((p) => {
    prepared = p;
  })
  .then(() => loadConfig())
  .then(() => initRefresh(config));
}

export function refreshDatabase(o) {
  switch (o.options.op) {
    case 'start':
      return startRefresh(config);
    case 'stop':
      return stopRefresh();
    default:
      return refreshStatus();
  }
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
      }
      break;
    default: break;
  }
  if (type === null) {
    return Promise.reject(`setConfig: Invalid type for ${key}: ${newValue}`);
  }

  return prepared.updateConfigValue.run(dolarizeQueryParams(key, type, value))
  .then(() => {
    config[key] = newValue;
    return newValue;
  });
}
