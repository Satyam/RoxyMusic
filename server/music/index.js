import { Router as createRouter } from 'express';
import { handleRequest } from '_server/utils';
import * as transactions from './transactions';
// import * as validators from './validators';


export default () =>
  transactions.init()
  .then(() => createRouter()
    .get('/refreshDb', handleRequest(
      transactions.refreshDatabase
    ))
    .get('/albums', handleRequest(
      transactions.getAlbums
    ))
    .get('/albums/:idAlbum', handleRequest(
      transactions.getAlbum
    ))
  );
