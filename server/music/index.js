import { Router as createRouter } from 'express';
import { handleRequest } from '_server/utils';
import * as transactions from './transactions';
import * as validators from './validators';


export default () =>
  transactions.init()
  .then(() => createRouter()
    .get('/refreshDb', handleRequest(
      transactions.refreshDatabase
    ))
    .get('/albums', handleRequest(
      transactions.getAlbums
    ))
    .get('/:pid', handleRequest(
      validators.validatePid,
      transactions.getProjectById
    ))
    .get('/:pid/:tid', handleRequest(
      validators.validatePid,
      validators.validateTid,
      transactions.getTaskByTid
    ))
    .post('/', handleRequest(
      validators.validatePrjData,
      transactions.addProject
    ))
    .post('/:pid', handleRequest(
      validators.validatePid,
      validators.validateTaskData,
      transactions.addTaskToProject
    ))
    .put('/:pid', handleRequest(
      validators.validatePid,
      validators.validatePrjData,
      transactions.updateProject
    ))
    .put('/:pid/:tid', handleRequest(
      validators.validatePid,
      validators.validateTid,
      validators.validateTaskData,
      transactions.updateTask
    ))
    .delete('/:pid', handleRequest(
      validators.validatePid,
      transactions.deleteProject
    ))
    .delete('/:pid/:tid', handleRequest(
      validators.validatePid,
      validators.validateTid,
      transactions.deleteTask
    ))
  );
