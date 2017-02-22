import restAPI from '_platform/restAPI';
import remoteAPI from '_client/../webClient/restAPI';
import asyncActionCreator from '_utils/asyncActionCreator';
import map from 'lodash/map';
import plainJoin from '_utils/plainJoin';

import {
  UPDATE_PLAYLIST,
  DELETE_PLAY_LIST,
  setConfig,
  getPlayLists,
  addPlayList,
  deletePlayList,
  push,
} from '_store/actions';

import {
  syncSelectors,
  configSelectors,
  playListSelectors,
} from '_store/selectors';

const NAME = 'sync';
let remote;
let remoteHost;
let musicDir;
let idDevice;

const local = restAPI(NAME);

export const START_SYNC = `${NAME}/Start Synchronization`;
export const GET_SERVER_PLAYLISTS = `${NAME}/Get Server Playlists`;
export const GET_CLIENT_PLAYLISTS = `${NAME}/Get CLient Playlists`;
export const SET_ACTION_FOR_SYNC = `${NAME}/Set Transfer action for sync`;
export const TRANSFER_ACTION = {
  SEND: 1,
  IMPORT: 2,
  DEL_CLIENT: 3,
  DEL_SERVER: 4,
  DO_NOTHING: 0,
};

export const PLAYLIST_TRANSFER_DONE = `${NAME}/signal playlist transfer done`;
export const COLLECT_TRACKS_FROM_IMPORTED_PLAYLISTS =
  `${NAME}/collect the idTracks in the imported playlists`;

export const GET_MISSING_TRACKS = `${NAME}/get missing tracks`;
export const GET_MISSING_ALBUMS = `${NAME}/get missing albums`;
export const GET_MISSING_ARTISTS = `${NAME}/get missing artists`;
export const IMPORT_TRACKS = `${NAME}/import tracks`;
export const SAVE_IMPORTED_TRACKS = `${NAME}/save imported tracks`;
export const UPDATE_TRACK_LOCATION = `${NAME}/update track location`;
export const IMPORT_ALBUMS = `${NAME}/import albums`;
export const SAVE_IMPORTED_ALBUMS = `${NAME}/save imported albums`;
export const IMPORT_ARTISTS = `${NAME}/import artists`;
export const SAVE_IMPORTED_ARTISTS = `${NAME}/save imported artists`;
export const UPDATE_ALBUM_ARTIST_MAP = `${NAME}/update album-artist map`;
export const CLEAR_ALL = `${NAME}/clear all`;
export const FIND_MISSING_MP3S = `${NAME}/find missing music files`;
export const UPDATE_DOWNLOAD_STATUS = `${NAME}/update download status`;
export const INCREMENT_PENDING = `${NAME}/increment pending`;

// console.log('cordova.file', cordova.file);

// These action creators workwith startSync (below)
export function getDeviceInfo(uuid) {
  return asyncActionCreator(
    START_SYNC,
    remote.read(`/myId/${uuid}`),
    { uuid }
  );
}

// startSync is called from sync/sync.jsx
export function startSync() {
  // "file:///storage/sdcard/"
  const UUID = window.device && `${window.device.model} : ${window.device.uuid}`;
  return (dispatch, getState) => {
    const state = getState();
    remoteHost = configSelectors.get(state, 'remoteHost');
    remote = remoteAPI(NAME, remoteHost);
    return dispatch(getDeviceInfo(UUID))
    .then((action) => {
      musicDir = action.payload.musicDir;
      idDevice = action.payload.idDevice;
      return (
        musicDir !== configSelectors.get(state, 'musicDir') &&
        dispatch(setConfig('musicDir', musicDir))
      );
    })
    ;
  };
}

// These action creators work with playListsCompare.jsx

export function getServerPlayLists() {
  return asyncActionCreator(
    GET_SERVER_PLAYLISTS,
    remote.read('/playlists')
  );
}

export function getClientPlayLists() {
  return (dispatch, getState) => {
    const state = getState();
    return Promise.resolve(dispatch(getPlayLists()))
    .then(() => dispatch({
      type: GET_CLIENT_PLAYLISTS,
      payload: { list: playListSelectors.orderedList(state) },
    }));
  };
}


// This works with playListItemCompare.jsx
export function setActionForSync(idPlayList, action) {
  return {
    type: SET_ACTION_FOR_SYNC,
    payload: {
      idPlayList,
      action,
    },
  };
}

// these are called by startPlayListTransfer, below
export function sendPlaylist(idPlayList, playList) {
  return asyncActionCreator(
    UPDATE_PLAYLIST,
    remote.update(`/playlist/${idPlayList}`, {
      name: playList.client.name,
      idTracks: playList.client.idTracks,
      lastUpdated: playList.client.lastUpdated,
      idDevice,
    }),
    {
      idPlayList,
      name: playList.client.name,
      idTracks: playList.client.idTracks,
      lastUpdated: playList.client.lastUpdated,
      idDevice,
    },
  );
}

export function importPlayList(idPlayList, playList) {
  const idTracks = playList.server.idTracks || [];
  return dispatch =>
    dispatch(addPlayList(playList.server.name, idTracks, idPlayList))
    .then(() => dispatch(asyncActionCreator(
      COLLECT_TRACKS_FROM_IMPORTED_PLAYLISTS,
      local.create('/missing/tracks', { idTracks })
    )));
}

export function delClientPlayList(idPlayList) {
  return deletePlayList(idPlayList);
}

export function delServerPlayList(idPlayList) {
  return asyncActionCreator(
    DELETE_PLAY_LIST,
    remote.delete(`/playlist/${idPlayList}`, { idDevice }),
    { idPlayList, idDevice }
  );
}

export function playListTransferDone(idPlayList) {
  return {
    type: PLAYLIST_TRANSFER_DONE,
    payload: {
      idPlayList,
    },
  };
}

// This is called by transferPlayLists.jsx
export function startPlayListTransfer() {
  return (dispatch, getState) => {
    const hash = syncSelectors.sideBySideHash(getState());
    return Promise.all(map(hash, (playList, idPlayList) =>
      playList.action && dispatch([
        null,
        sendPlaylist,
        importPlayList,
        delClientPlayList,
        delServerPlayList,
      ][playList.action](idPlayList, playList))
      .then(() => dispatch(playListTransferDone(idPlayList)))
    ))
    .then(() => dispatch(push('/sync/ImportCatalogInfo')));
  };
}

// These are called from importCatalog below
export function getMissingTracks() {
  return dispatch =>
    dispatch(asyncActionCreator(
      GET_MISSING_TRACKS,
      local.read('/missing/tracks')
    ))
    .then((action) => {
      const missingIdTracks = action.payload.list;
      if (missingIdTracks.length) {
        const batchesOfMissingTracks = [];
        for (let i = 0; i < missingIdTracks.length; i += 100) {
          batchesOfMissingTracks.push(missingIdTracks.slice(i, i + 100));
        }
        return batchesOfMissingTracks.reduce(
          (ps, batch) => ps.then(() =>
            dispatch(asyncActionCreator(
              IMPORT_TRACKS,
              remote.read(`/tracks/${batch.join(',')}`),
              { batch }
            ))
          ),
          Promise.resolve()
        )
        .then((action2) => {
          const tracks = action2.payload.list;
          return tracks && dispatch(asyncActionCreator(
            SAVE_IMPORTED_TRACKS,
            local.create('/tracks', tracks),
            { list: tracks }
          ));
        });
      }
      return null;
    });
}

export function getMissingAlbums() {
  return dispatch =>
    dispatch(asyncActionCreator(
      GET_MISSING_ALBUMS,
      local.read('/missing/albums')
    ))
    .then(action => action.payload.list)
    .then(missingIdAlbums =>
      missingIdAlbums.length &&
        dispatch(asyncActionCreator(
          IMPORT_ALBUMS,
          remote.read(`/albums/${missingIdAlbums.join(',')}`)
        ))
        .then(action => dispatch(asyncActionCreator(
          SAVE_IMPORTED_ALBUMS,
          local.create('/albums', action.payload.list)
        )))
    )
  ;
}

export function getMissingArtists() {
  return dispatch =>
    dispatch(asyncActionCreator(
      GET_MISSING_ARTISTS,
      local.read('/missing/artists')
    ))
    .then(action => action.payload.list)
    .then(missingIdArtists =>
      missingIdArtists.length &&
        dispatch(asyncActionCreator(
          IMPORT_ARTISTS,
          remote.read(`/artists/${missingIdArtists.join(',')}`)
        ))
        .then(action => dispatch(asyncActionCreator(
          SAVE_IMPORTED_ARTISTS,
          local.create('/artists', action.payload.list)
        )))
    );
}

export function updateAlbumArtistMap() {
  return asyncActionCreator(
    UPDATE_ALBUM_ARTIST_MAP,
    local.update('/albumArtistMap')
  );
}

export function clearAll() {
  return {
    type: CLEAR_ALL,
  };
}

// Called from importCatalogInfo.jsx
export function importCatalog() {
  return dispatch =>
    dispatch(getMissingTracks())
    .then(() => dispatch(getMissingAlbums()))
    .then(() => dispatch(getMissingArtists()))
    .then(() => dispatch(updateAlbumArtistMap()))
    .then(() => {
      dispatch(clearAll());
      return dispatch(push('/sync/TransferFiles'));
    })
    ;
}

// These all belong to transferFiles.jsx
export function getMissingMp3s() {
  return asyncActionCreator(
    FIND_MISSING_MP3S,
    local.read('/mp3PendingTransfer')
  );
}

export function updateTrackLocation(idTrack, location) {
  return asyncActionCreator(
    UPDATE_TRACK_LOCATION,
    local.update(`/track/${idTrack}`, { location }),
    { location }
  );
}

export function updateDownloadStatus(index, status) {
  return {
    type: UPDATE_DOWNLOAD_STATUS,
    payload: {
      index,
      status,
    },
  };
}

export function incrPending() {
  return {
    type: INCREMENT_PENDING,
  };
}

export function downloadTrack({ idTrack, artist, album, title, ext }) {
  function sanitize(name) {
    return name.replace('/', '-').replace('<', '').replace('>', '');
  }
  return new Promise((resolve, reject) =>
    window.resolveLocalFileSystemURL(
      musicDir,
      musicDirEntry => musicDirEntry.getDirectory(
        sanitize(artist),
        { create: true },
        artistDirEntry => artistDirEntry.getDirectory(
          sanitize(album),
          { create: true },
          albumDirEntry => albumDirEntry.getFile(
            `${sanitize(title)}${ext}`,
            { create: true },
            fileEntry => (new window.FileTransfer()).download(
              plainJoin(remoteHost, 'tracks', idTrack),
              fileEntry.toURL(),
              resolve,
              err => reject(`${JSON.stringify(err)}  on fileTransfer of  ${idTrack}`),
              true,
              { headers: { Connection: 'close' } }
            ),
            err => reject(`${JSON.stringify(err)}  on getFile ${title} in ${albumDirEntry.fullPath}`)
          ),
          err => reject(`${JSON.stringify(err)}  on getDirectory ${album} in ${artistDirEntry.fullPath}`)
        ),
        err => reject(`${JSON.stringify(err)}  on getDirectory ${artist} in ${musicDirEntry.fullPath}`)
      ),
      err => reject(`${JSON.stringify(err)}  on resolveLocalFileSystemURL ${musicDir}`)
    )
  );
}

export function importOneTrack() {
  return (dispatch, getState) => {
    const state = getState();
    const { list, index } = syncSelectors.mp3TransferPending(state);
    if (index === list.length) return Promise.resolve('done');
    const pending = list[index];
    dispatch(updateDownloadStatus(index, 1));
    const audioExtensions = configSelectors.get(state, 'portableAudioExtensions').split(',');
    if (audioExtensions.indexOf(pending.ext.substr(1)) === -1) {
      pending.ext = '.mp3';
    }
    return downloadTrack(pending)
    .then(fileEntry =>
      dispatch(updateTrackLocation(
        pending.idTrack,
        fileEntry.toURL().replace(musicDir, '')
      ))
    )
    .then(() => dispatch(updateDownloadStatus(index, 2)))
    .then(() => dispatch(incrPending()))
    .then(() => dispatch(importOneTrack()))
    ;
  };
}

export function startMp3Transfer() {
  return dispatch =>
    dispatch(getMissingMp3s())
    .then(() => dispatch(importOneTrack()))
    .then(() => dispatch(push('/sync/AllDone')))
    ;
}
