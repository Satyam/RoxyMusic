import {
  getPlayLists,
} from './playlists';

let prepared = {};

let $db;

export function init(db) {
  $db = db;
  return db.prepareAll({
    getMyId: 'select idDevice, musicDir from Devices where uuid = $uuid',
    setMyId: 'insert into Devices (uuid) values ($uuid)',
    insertTrack: `insert into Tracks (
         idTrack,  title,  idArtist,  idAlbumArtist,  idAlbum,  track,
         year,  duration,  idGenre,  location,  fileModified,  size, ext
      ) values (
        $idTrack, $title, $idArtist, $idAlbumArtist, $idAlbum, $track,
        $year, $duration, $idGenre, $location, $fileModified, $size, $ext
      )`,
    insertAlbum: 'insert into Albums values ($idAlbum, $album)',
    insertArtist: 'insert into Artists values ($idArtist, $artist)',
    truncateAlbumArtist: 'delete from AlbumArtistMap',
    updateAlbumArtist: `insert into AlbumArtistMap (idArtist, idAlbum)
      select distinct idAlbumArtist as idArtist, idAlbum
      from Tracks where idAlbumArtist is not null and idAlbum is not null`,
    transferPending: `select
        idTrack,
        coalesce(albumArtist, artist, 'unknown artist') as artist,
        coalesce(album, 'unknown album') as album,
        title,
        ext
      from Tracks
      left join Albums using(idAlbum)
      left join (select artist as albumArtist, idArtist as idAlbumArtist from Artists) using (idAlbumArtist)
      left join Artists using (idArtist)
      where location is null`,
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

export function transferPending() {
  return prepared.transferPending.all()
  .then(list => ({ list }));
}

export function updateTrackLocation(o) {
  return prepared.updateTrackLocation.run(
    Object.assign(o.keys, o.data)
  );
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
    '/pending': {
      read: transferPending,
    },
    '/track/:idTrack': {
      update: updateTrackLocation,
    },
  }));
