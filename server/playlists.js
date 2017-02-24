import { join } from 'path';
import denodeify from 'denodeify';
import uuid from 'uuid/v1';

import splitIdTracks from '_server/utils/splitIdTracks';

import { getConfig } from '_server/config';

const writeFile = (
  BUNDLE === 'cordova'
  ? () => Promise.reject('Filesystem not available')
  : denodeify(require('fs').writeFile)
);

let prepared = {};
let $db;

export function init(db) {
  $db = db;
  return db.prepareAll({
    getPlayLists: 'select * from PlayLists',
    getPlayList: 'select * from PlayLists where idPlayList = $idPlayList',
    addPlayList:
      `insert or replace into PlayLists (idPlayList, name, idTracks, lastUpdated, idDevice)
          values ($idPlayList, $name, $idTracks, CURRENT_TIMESTAMP, $idDevice)`,
    deletePlayList: `update PlayLists set idTracks = null, lastUpdated = CURRENT_TIMESTAMP,
      idDevice = $idDevice where idPlayList = $idPlayList`,
  })
  .then((p) => {
    prepared = p;
  });
}

// getPlayLists: 'select * from PlayLists order by name',
export function getPlayLists() {
  return prepared.getPlayLists.all()
  .then(playLists => ({ list: playLists.map(splitIdTracks) }));
}

// getPlayList: 'select* from PlayLists where idPlayList = $idPlayList',
export function getPlayList(o) {
  return prepared.getPlayList.get(o.keys)
  .then(splitIdTracks);
}

// addPlayList:
//   `insert into PlayLists (idPlayList,  name,  idTracks, lastUpdated,        idDevice)
//                  values ($idPlayList, $name, $idTracks, CURRENT_TIMESTAMP, $idDevice)`
export function addPlayList(o) {
  const idPlayList = o.keys.idPlayList || uuid();
  return prepared.addPlayList.run({
    idPlayList,
    name: o.data.name,
    idTracks: o.data.idTracks.join(','),
    idDevice: o.data.idDevice || 0,
  })
  .then(() => $db.get('select CURRENT_TIMESTAMP as lastUpdated'))
  .then(row => ({ idPlayList, lastUpdated: row.lastUpdated }));
}

// updatePlayList: `update PlayLists set name = $name,
//     idTracks = $idTracks, lastUpdated = CURRENT_TIMESTAMP, idDevice = $idDevice
//     where idPlayList = $idPlayList`,
export function updatePlayList(o) {
  const name = o.data.name;
  const idTracks = o.data.idTracks;
  return $db.run(
    `insert or replace into PlayLists (
      idPlayList,
      ${name ? 'name,' : ''}
      ${idTracks ? 'idTracks,' : ''}
      lastUpdated,
      idDevice
    ) values (
      $idPlayList,
      ${name ? '$name,' : ''}
      ${idTracks ? '$idTracks,' : ''}
      CURRENT_TIMESTAMP,
      $idDevice
    )`,
    {
      idPlayList: o.keys.idPlayList,
      name: name || undefined,
      idTracks: idTracks ? idTracks.join(',') : undefined,
      idDevice: o.data.idDevice || 0,
    }
  );
}

// deletePlayList: `update PlayLists set idTracks = null, lastUpdated = CURRENT_TIMESTAMP,
//   idDevice = $idDevice where idPlayList = $idPlayList`,
export function deletePlayList(o) {
  return prepared.deletePlayList.run({
    idPlayList: o.keys.idPlayList,
    idDevice: o.data.idDevice || 0,
  });
}

function saveOnePlayList(playList) {
  const musicDir = getConfig('musicDir');
  const fileName = join(musicDir, `${playList.name}.m3u`);
  return $db.all(
    `select title, duration, location, coalesce(AlbumArtist.artist, Artist.artist) as artist
      from Tracks
      left join Artists as AlbumArtist on idAlbumArtist = AlbumArtist.idArtist
      left join Artists as Artist on idAlbumArtist = Artist.idArtist
      where title is not null and idTrack in (${playList.idTracks})`)
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

export default db =>
    init(db)
    .then(() => ({
      '/': {
        read: getPlayLists,
        create: addPlayList,
      },
      '/:idPlayList': {
        read: getPlayList,
        create: addPlayList,
        update: updatePlayList,
        delete: deletePlayList,
      },
      '/saveAll': {
        create: saveAllPlayLists,
      },
      '/save/:idPlayList': {
        create: [
          savePlayList,
        ],
      },
    })
    );
