import { Router as createRouter } from 'express';
import { join } from 'path';
import denodeify from 'denodeify';
import fs from 'fs';

import { handleRequest } from '_server/utils/handleRequest';
import * as validators from '_server/utils/validators';
import splitIdTracks from '_server/utils/splitIdTracks';

import { getConfig } from '_server/config';

const writeFile = denodeify(fs.writeFile);

let prepared = {};

export function init() {
  return db.prepareAll({
    getPlayLists: 'select * from PlayLists',
    getPlayList: 'select * from PlayLists where idPlayList = $idPlayList',
    addPlayList: 'insert into PlayLists (name) values ($name)',
    updatePlayList: 'update PlayLists set lastPlayed = $lastPlayed, idTracks = $idTracks where idPlayList = $idPlayList',
    renamePlayList: 'update PlayLists set name = $name where idPlayList = $idPlayList',
    deletePlayList: 'delete from PlayLists  where idPlayList = $idPlayList',
  })
  .then((p) => {
    prepared = p;
  });
}

// getPlayLists: 'select * from PlayLists order by name',
export function getPlayLists() {
  return prepared.getPlayLists.all()
  .then(playLists => playLists.map(splitIdTracks));
}

// getPlayList: 'select* from PlayLists where idPlayList = $idPlayList',
export function getPlayList(o) {
  return prepared.getPlayList.get({
    $idPlayList: o.keys.idPlayList,
  })
  .then(splitIdTracks);
}

// addPlayList: 'insert into PlayLists (name) values ($name)',
export function addPlayList(o) {
  return prepared.addPlayList.run({ $name: o.data.name });
}

// updatePlayList: 'update PlayLists
// set lastPlayed = $lastPlayed, idTracks = $idTracks where idPlayList = $idPlayList',
export function updatePlayList(o) {
  return prepared.updatePlayList.run({
    $idPlayList: o.keys.idPlayList,
    $lastPlayed: o.data.lastPlayed,
    $idTracks: o.data.idTracks.join(','),
  });
}

// renamePlayList: 'update PlayLists set name = $name where idPlayList = $idPlayList',

export function renamePlayList(o) {
  return prepared.renamePlayList.run({
    $idPlayList: o.keys.idPlayList,
    $name: o.data.name,
  });
}
// deletePlayList: 'delete from PlayLists  where idPlayList = $idPlayList',
export function deletePlayList(o) {
  return prepared.deletePlayList.run({
    $idPlayList: o.keys.idPlayList,
  });
}

function saveOnePlayList(playList) {
  const musicDir = getConfig('musicDir');
  const fileName = join(musicDir, `${playList.name}.m3u`);
  return db.all(
    `select title, duration, location, coalesce(AlbumArtist.artist, Artist.artist) as artist
      from Tracks
      left join People as AlbumArtist on idAlbumArtist = AlbumArtist.idPerson
      left join People as Artist on idAlbumArtist = Artist.idPerson
      where idTrack in (${playList.idTracks})`)
    .then(tracks => tracks.reduce((m3u, track) =>
      `${m3u}
#EXTINF:${track.duration || -1},${track.artist || ''} - ${track.title || ''}
${track.location}`,
      '#EXTM3U'
    ))
//    .then(m3u => console.log('----%s\n%s', fileName, m3u))
    .then(m3u => writeFile(fileName, m3u))
    .then(() => fileName);
}

export function saveAllPlayLists() {
  return prepared.getPlayLists.all()
  .then(playLists => Promise.all(
    playLists.map(saveOnePlayList)
  ));
}

export function savePlayList(o) {
  return getPlayList(o)
  .then(saveOnePlayList);
}

export default () =>
  init()
  .then(() => createRouter()
    .get('/', handleRequest(
      getPlayLists
    ))
    .get('/:idPlayList', handleRequest(
      validators.idPlayList,
      getPlayList
    ))
    .post('/saveAll', handleRequest(
      saveAllPlayLists
    ))
    .post('/save/:idPlayList', handleRequest(
      validators.idPlayList,
      savePlayList
    ))
    .post('', handleRequest(
      addPlayList
    ))
    .put('/:idPlayList', handleRequest(
      validators.idPlayList,
      updatePlayList
    ))
    .put('/:idPlayList/name', handleRequest(
      validators.idPlayList,
      renamePlayList
    ))
    .delete('/:idPlayList', handleRequest(
      validators.idPlayList,
      deletePlayList
    ))
  );
