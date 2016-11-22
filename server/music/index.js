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
      validators.idAlbum,
      transactions.getAlbum
    ))
    .get('/artists', handleRequest(
      transactions.getArtists
    ))
    .get('/artists/:idArtist', handleRequest(
      validators.idArtist,
      transactions.getArtist
    ))
    .get('/songs', handleRequest(
      transactions.getSongs
    ))
    .get('/tracks/:idTracks', handleRequest(
      validators.idTracks,
      transactions.getTracks
    ))
    .get('/playLists', handleRequest(
      transactions.getPlayLists
    ))
    .get('/playLists/:idPlayList', handleRequest(
      validators.idPlayList,
      transactions.getPlayList
    ))
    .post('/playLists/saveAll', handleRequest(
      transactions.saveAllPlayLists
    ))
    .post('/playLists/save/:idPlayList', handleRequest(
      validators.idPlayList,
      transactions.savePlayList
    ))
    .post('/playLists', handleRequest(
      transactions.addPlayList
    ))
    .put('/playLists/:idPlayList', handleRequest(
      validators.idPlayList,
      transactions.updatePlayList
    ))
    .put('/playLists/:idPlayList/name', handleRequest(
      validators.idPlayList,
      transactions.renamePlayList
    ))
    .delete('/playLists/:idPlayList', handleRequest(
      validators.idPlayList,
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
