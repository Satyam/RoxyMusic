let prepared = {};

export function init(db) {
  return db.prepareAll({
    getMyId: 'select idDevice from Devices where uuid = $uuid',
    setMyId: 'insert into Devices (uuid) values ($uuid)',
    getDifferences: `select
        idPlayListHistory, timeChanged, PlayLists.idPlayList as idPlayList,
        PlayLists.name as currentName, PlayLists.idTracks as currentIdTracks,
        PlayListsHistory.name as oldName,  PlayListsHistory.idTracks as oldIdTracks
      from  PlayLists
      left join PlayListsHistory using(idPlayList)
      where  (currentName != ifnull(oldName, '')  or currentIdTracks != ifnull(oldIdTracks, ''))
      and (idDevice = $myIdDevice or idDevice is null)`,
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


export function getDifferences(o) {
  return prepared.getDifferences.all(o)
    .then(list => ({ list }));
}

export function createHistory(o) {
  return prepared.createHistory.run(
    Object.assign(o.keys, o.data)
  )
  .then(res => ({ idPlayListHistory: res.lastID }));
}

export function updateHistory(o) {
  return prepared.updateHistory.run(
    Object.assign(o.keys, o.data)
  );
}

export default db =>
  init(db)
  .then(() => ({
    '/myId/:uuid': {
      read: getMyId,
    },
    '/differences/:idDevice': {
      read: getDifferences,
    },
    '/history/:idDevice': {
      create: createHistory,
      update: updateHistory,
    },
  }));
