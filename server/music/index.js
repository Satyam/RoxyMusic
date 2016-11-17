import { Router as createRouter } from 'express';
import { handleRequest } from '_server/utils/handleRequest';
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
    .get('/albums/:idAlbum', handleRequest(
      validators.validateIdAlbum,
      transactions.getAlbum
    ))
    .get('/artists', handleRequest(
      transactions.getArtists
    ))
    .get('/artists/:idArtist', handleRequest(
      validators.validateIdArtist,
      transactions.getArtist
    ))
    .get('/songs', handleRequest(
      transactions.getSongs
    ))
    .get('/tracks/:idTracks', handleRequest(
      validators.validateIdTracks,
      transactions.getTracks
    ))
    .get('/playLists', handleRequest(
      transactions.getPlayLists
    ))
    .get('/playLists/:idPlayList', handleRequest(
      validators.validateIdPlayList,
      transactions.getPlayList
    ))
    .post('/playLists', handleRequest(
      transactions.addPlayList
    ))
    .put('/playLists/:idPlayList', handleRequest(
      validators.validateIdPlayList,
      transactions.updatePlayList
    ))
    .put('playLists/:idPlayList/name', handleRequest(
      validators.validateIdPlayList,
      transactions.renamePlayList
    ))
    .delete('playLists/:idPlayList', handleRequest(
      validators.validateIdPlayList,
      transactions.deletePlayList
    ))
    .get('/config/:key', handleRequest(
      transactions.getConfig
    ))
    .post('/config/:key', handleRequest(
      transactions.setConfig
    ))
    .put('/config/:key', handleRequest(
      transactions.setConfig
    ))
  );
