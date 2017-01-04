import {
  getPlayList,
} from './playlists';

let prepared = {};

let $db;

export function init(db) {
  $db = db;
  return db.prepareAll({
    getMyId: 'select idDevice from Devices where uuid = $uuid',
    setMyId: 'insert into Devices (uuid) values ($uuid)',
    getHistory: `select
        idPlayListHistory, timeChanged, PlayLists.idPlayList as idPlayList,
        PlayLists.name as serverName, PlayLists.idTracks as serverIdTracks,
        PlayListsHistory.name as previousName,  PlayListsHistory.idTracks as previousIdTracks
      from  PlayLists
      left join PlayListsHistory using(idPlayList)
      where  (serverName != ifnull(previousName, '')  or serverIdTracks != ifnull(previousIdTracks, ''))
      and (idDevice = $idDevice or idDevice is null)`,
    createHistory: `insert into PlayListsHistory
      (idPlayList, idDevice, timeChanged, name, idTracks)
      values ($idPlayList, $idDevice, datetime('now'), $name, $idTracks)`,
    updateHistory: `update PlayListsHistory
      set name = $name, idTracks = $idTracks, timeChanged = datetime('now')
      where idPlayListHistory = $idPlayListHistory`,
    insertTrack: `insert into Tracks (
         idTrack,  title,  idArtist,  idAlbumArtist,  idAlbum,  track,
         year,  duration,  idGenre,  location,  fileModified,  size)
      values(
        $idTrack, $title, $idArtist, $idAlbumArtist, $idAlbum, $track,
        $year, $duration, $idGenre, $location, $fileModified, $size
      )`,
    insertAlbum: 'insert into Albums values ($idAlbum, $album)',
    insertArtist: 'insert into People values ($idPerson, $artist)',
    truncateAlbumArtist: 'delete from AlbumArtistMap',
    updateAlbumArtist: `insert into AlbumArtistMap (idArtist, idAlbum)
      select distinct idAlbumArtist as idArtist, idAlbum
      from Tracks where idAlbumArtist is not null and idAlbum is not null`,
    notYetTransfered: `select
        idTrack,
        coalesce(albumArtist, artist, 'unknown artist') as artist,
        coalesce(album, 'unknown album') as album,
        title
      from Tracks
      left join Albums using(idAlbum)
      left join (select artist as albumArtist, idPerson as idAlbumArtist from People) using (idAlbumArtist)
      left join People on idArtist = idPerson
      where location is null`,
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
  function mapTracks(ids) {
    return (ids && ids.split(',').map(id => parseInt(id, 10)));
  }
  return prepared.getHistory.all(o)
    .then(histories => ({
      list: histories.map(history => Object.assign(history, {
        serverIdTracks: mapTracks(history.serverIdTracks),
        previousIdTracks: mapTracks(history.previousIdTracks),
      })),
    }));
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

export function getTracks(o) {
  return $db.all(
    `select idTrack, title, idArtist, idAlbumArtist,idAlbum,
        track, year, duration, idGenre
        from Tracks where idTrack in (${o.keys.idTracks})`
  )
  .then(list => ({ list }));
}

export function saveImportedTracks(o) {
  return o.data.reduce(
    (p, track) => p.then(() => prepared.insertTrack.run(track)),
    Promise.resolve()
  );
}

export function getAlbums(o) {
  return $db.all(
    `select * from Albums where idAlbum in (${o.keys.idAlbums})`
  )
  .then(list => ({ list }));
}

export function saveImportedAlbums(o) {
  return o.data.reduce(
    (p, album) => p.then(() => prepared.insertAlbum.run(album)),
    Promise.resolve()
  );
}

export function getArtists(o) {
  return $db.all(
    `select * from People where idPerson in (${o.keys.idArtists})`
  )
  .then(list => ({ list }));
}

export function saveImportedArtist(o) {
  return o.data.reduce(
    (p, artist) => p.then(() => prepared.insertArtist.run(artist)),
    Promise.resolve()
  );
}
export function updateAlbumArtistMap() {
  return prepared.truncateAlbumArtist.run()
  .then(() => prepared.updateAlbumArtist.run());
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
    '/tracks/:idTracks': {
      read: getTracks,
    },
    '/tracks': {
      create: saveImportedTracks,
    },
    '/albums/:idAlbums': {
      read: getAlbums,
    },
    '/albums': {
      create: saveImportedAlbums,
    },
    '/artists/:idArtists': {
      read: getArtists,
    },
    '/artists': {
      create: saveImportedArtist,
    },
    '/albumArtistMap': {
      update: updateAlbumArtistMap,
    },
  }));
