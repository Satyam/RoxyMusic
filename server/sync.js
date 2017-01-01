import {
  getPlayList,
} from './playlists';

let prepared = {};

export function init(db) {
  return db.prepareAll({
    getMyId: 'select idDevice from Devices where uuid = $uuid',
    setMyId: 'insert into Devices (uuid) values ($uuid)',
    getHistory: `select
        idPlayListHistory, timeChanged, PlayLists.idPlayList as idPlayList,
        PlayLists.name as currentName, PlayLists.idTracks as currentIdTracks,
        PlayListsHistory.name as oldName,  PlayListsHistory.idTracks as oldIdTracks
      from  PlayLists
      left join PlayListsHistory using(idPlayList)
      where  (currentName != ifnull(oldName, '')  or currentIdTracks != ifnull(oldIdTracks, ''))
      and (idDevice = $idDevice or idDevice is null)`,
    createHistory: `insert into PlayListsHistory
      (idPlayList, idDevice, timeChanged, name, idTracks)
      values ($idPlayList, $idDevice, datetime('now'), $name, $idTracks)`,
    updateHistory: `update PlayListsHistory
      set name = $name, idTracks = $idTracks, timeChanged = datetime('now')
      where idPlayListHistory = $idPlayListHistory`,
  })
  .then((p) => {
    prepared = p;
  });
}

export function getMyId(o) {
  return prepared.getMyId.get(o.keys)
  .then(data => data ||
    prepared.setMyId.run(o.keys)
    .then(res => ({ idDevice: res.lastID }))
  );
}

export function getHistory(o) {
  return prepared.getHistory.all(o)
    .then(list => ({ list }));
}

export function createHistory(o) {
  return prepared.createHistory.run({
    idDevice: o.keys.idDevice,
    idPlayList: o.data.idPlayList,
    name: o.data.name,
    idTracks: o.data.idTracks.join(','),
  })
  .then(res => ({ idPlayListHistory: res.lastID }));
}

export function updateHistory(o) {
  return prepared.updateHistory.run({
    idPlayListHistory: o.keys.idPlayListHistory,
    name: o.data.name,
    idTracks: o.data.idTracks.join(','),
  });
}

export default db =>
  init(db)
  .then(() => ({
    '/myId/:uuid': {
      read: getMyId,
    },
    '/history/:idDevice': {
      read: getHistory,
      create: createHistory,
    },
    '/history/:idPlayListHistory': {
      update: updateHistory,
    },
    '/playlist/:idPlayList': {
      read: getPlayList,
    },
  }));
