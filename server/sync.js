import {
  getPlayLists,
  addPlayList,
  updatePlayList,
  deletePlayList,
} from './playlists';

let prepared = {};

let $db;

export function init(db) {
  $db = db;
  return db.prepareAll({
    getMyId: 'select idDevice, musicDir from Devices where uuid = $uuid',
    setMyId: 'insert into Devices (uuid) values ($uuid)',
    insertTrack: `insert or replace into Tracks (
         idTrack,  title,  idArtist,  idAlbumArtist,  idAlbum,  track,
         year,  duration,  idGenre,  location,  fileModified,  size, ext
      ) values (
        $idTrack, $title, $idArtist, $idAlbumArtist, $idAlbum, $track,
        $year, $duration, $idGenre, $location, $fileModified, $size, $ext
      )`,
    missingTracks: 'select idTrack from Tracks where title is null',
    missingAlbums: `select idAlbum from Tracks left join Albums using (idAlbum)
        where Albums.idAlbum is null and Tracks.idAlbum is not null`,
    missingArtists: `select idArtist from Tracks
        left join Artists using (idArtist)
        where Artists.idArtist is null and Tracks.idArtist is not null
      union
        select idAlbumArtist as idArtist from Tracks
        left join Artists on Artists.idArtist = Tracks.idAlbumArtist
        where Artists.idArtist is null and  Tracks.idAlbumArtist is not null`,
    insertAlbum: 'insert into Albums values ($idAlbum, $album)',
    insertArtist: 'insert into Artists values ($idArtist, $artist)',
    truncateAlbumArtist: 'delete from AlbumArtistMap',
    updateAlbumArtist: `insert into AlbumArtistMap (idArtist, idAlbum)
      select distinct idAlbumArtist as idArtist, idAlbum
      from Tracks where idAlbumArtist is not null and idAlbum is not null`,
    mp3PendingTransfer: `select
        idTrack,
        coalesce(albumArtist, artist, 'unknown artist') as artist,
        coalesce(album, 'unknown album') as album,
        title,
        ext
      from Tracks
      left join Albums using(idAlbum)
      left join (select artist as albumArtist, idArtist as idAlbumArtist from Artists) using (idAlbumArtist)
      left join Artists using (idArtist)
      where title is not null and location is null`,
    updateTrackLocation: `update Tracks set location = $location
      where idTrack = $idTrack`,
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


export function getTracks(o) {
  return $db.all(
    `select idTrack, title, idArtist, idAlbumArtist,idAlbum,
        track, year, duration, idGenre, ext
        from Tracks
        where title is not null and idTrack in (${o.keys.idTracks})`
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
    `select * from Artists where idArtist in (${o.keys.idArtists})`
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

export function mp3PendingTransfer() {
  return prepared.mp3PendingTransfer.all()
  .then(list => ({ list }));
}

export function updateTrackLocation(o) {
  return prepared.updateTrackLocation.run(
    Object.assign(o.keys, o.data)
  );
}

export function missingAlbums() {
  return prepared.missingAlbums.all()
  .then(rows => ({ list: rows.map(row => row.idAlbum) }));
}

export function missingArtists() {
  return prepared.missingArtists.all()
  .then(rows => ({ list: rows.map(row => row.idArtist) }));
}

export function addMissingTracks(o) {
  const idTracks = o.data.idTracks;
  return (
    idTracks.length
    ? $db.run(
      `insert or ignore into Tracks (idTrack) values (${idTracks.join('),(')})`
    )
    : Promise.resolve()
  );
}

export function getMissingTracks() {
  return prepared.missingTracks.all()
  .then(rows => ({ list: rows.map(row => row.idTrack) }));
}

export default db =>
  init(db)
  .then(() => ({
    '/myId/:uuid': {
      read: getMyId,
    },
    '/playlists': {
      read: getPlayLists,
    },
    '/playlist/:idPlayList': {
      create: addPlayList,
      update: updatePlayList,
      delete: deletePlayList,
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
    '/mp3PendingTransfer': {
      read: mp3PendingTransfer,
    },
    '/track/:idTrack': {
      update: updateTrackLocation,
    },
    '/missing/albums': {
      read: missingAlbums,
    },
    '/missing/artists': {
      read: missingArtists,
    },
    '/missing/tracks': {
      read: getMissingTracks,
      create: addMissingTracks,
    },
  }));
