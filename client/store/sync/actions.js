import restAPI from '_platform/restAPI';
import remoteAPI from '_client/../webClient/restAPI';
import asyncActionCreator from '_utils/asyncActionCreator';
import difference from 'lodash/difference';
import union from 'lodash/union';
import compact from 'lodash/compact';
import unique from 'lodash/uniq';
import reduce from 'lodash/reduce';
import map from 'lodash/map';
import plainJoin from '_utils/plainJoin';

import {
  UPDATE_PLAYLIST,
  DELETE_PLAY_LIST,
  setConfig,
  getPlayLists,
  addPlayList,
  deletePlayList,
} from '_store/actions';

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
export const IMPORT_TRACKS = `${NAME}/import tracks`;
export const SAVE_IMPORTED_TRACKS = `${NAME}/save imported tracks`;
export const UPDATE_TRACK_LOCATION = `${NAME}/update track location`;
export const IMPORT_ALBUMS = `${NAME}/import albums`;
export const SAVE_IMPORTED_ALBUMS = `${NAME}/save imported albums`;
export const IMPORT_ARTISTS = `${NAME}/import artists`;
export const SAVE_IMPORTED_ARTISTS = `${NAME}/save imported artists`;
export const UPDATE_ALBUM_ARTIST_MAP = `${NAME}/update album-artist map`;
export const CLEAR_ALL = `${NAME}/clear all`;
export const FIND_TRANSFER_PENDING = `${NAME}/find pending transfer`;
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
    const config = getState().config;
    remoteHost = config.remoteHost;
    remote = remoteAPI(NAME, remoteHost);
    return dispatch(getDeviceInfo(UUID))
    .then((action) => {
      musicDir = action.payload.musicDir;
      idDevice = action.payload.idDevice;
      return (
        musicDir !== config.musicDir &&
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
    const playLists = getState().playLists;
    return Promise.resolve(playLists.status === 2 || dispatch(getPlayLists()))
    .then(() => Object.values(getState().playLists.hash))
    .then(list => dispatch({
      type: GET_CLIENT_PLAYLISTS,
      payload: { list },
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
    remote.update(idPlayList, {
      name: playList.client.name,
      idTracks: playList.client.idTracks,
      idDevice,
    }),
    {
      idPlayList,
      name: playList.client.name,
      idTracks: playList.client.idTracks,
      idDevice,
    },
  );
}

export function importPlayList(idPlayList, playList) {
  return addPlayList(playList.server.name, playList.server.idTracks, idPlayList);
}

export function delClientPlayList(idPlayList) {
  return deletePlayList(idPlayList);
}

export function delServerPlayList(idPlayList) {
  return asyncActionCreator(
    DELETE_PLAY_LIST,
    remote.delete(idPlayList, { idDevice }),
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
    const hash = getState().sync.hash;
    return Promise.all(map(hash, (playList, idPlayList) =>
      dispatch([
        null,
        sendPlaylist,
        importPlayList,
        delClientPlayList,
        delServerPlayList,
      ][playList.action](idPlayList, playList))
      .then(() => dispatch(playListTransferDone(idPlayList)))
    ));
  };
}

// The
export function getMissingAlbums() {
  return (dispatch, getState) => {
    const state = getState();
    const neededIdAlbums = compact(state.sync.tracks.map(track => track.idAlbum));
    const currentIdAlbums = Object.keys(state.albums.hash).map(id => parseInt(id, 10));
    const missingIdAlbums = difference(neededIdAlbums, currentIdAlbums);
    if (missingIdAlbums.length === 0) return null;
    return dispatch(asyncActionCreator(
      IMPORT_ALBUMS,
      remote.read(`/albums/${missingIdAlbums.join(',')}`),
      { missingIdAlbums }
    ))
    .then(() => dispatch(asyncActionCreator(
      SAVE_IMPORTED_ALBUMS,
      local.create('/albums', getState().sync.albums),
      { tracks: getState().sync.albums }
    )));
  };
}

export function getMissingArtists() {
  return (dispatch, getState) => {
    const state = getState();
    const neededIdArtists = compact(state.sync.tracks.map(track => track.idArtist));
    const neededIdAlbumArtists = compact(state.sync.tracks.map(track => track.idAlbumArtist));
    const currentIdArtists = Object.keys(state.albums.hash).map(id => parseInt(id, 10));
    const missingIdArtists = difference(
      unique(neededIdArtists, neededIdAlbumArtists), currentIdArtists
    );
    if (missingIdArtists.length === 0) return null;
    return dispatch(asyncActionCreator(
      IMPORT_ARTISTS,
      remote.read(`/artists/${missingIdArtists.join(',')}`),
      { missingIdArtists }
    ))
    .then(() => dispatch(asyncActionCreator(
      SAVE_IMPORTED_ARTISTS,
      local.create('/artists', getState().sync.artists),
      { tracks: getState().sync.artists }
    )));
  };
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

export function getTransferPending() {
  return asyncActionCreator(
    FIND_TRANSFER_PENDING,
    local.read('/pending')
  );
}

export function updateTrackLocation(idTrack, location) {
  return asyncActionCreator(
    UPDATE_TRACK_LOCATION,
    local.update(`/track/${idTrack}`, { location }),
    { location }
  );
}

export function updateDownloadStatus(i, status) {
  return {
    type: UPDATE_DOWNLOAD_STATUS,
    payload: {
      i,
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
    const sync = getState().sync;
    const i = sync.i;
    if (i === sync.pending.length) return Promise.resolve('done');
    const pending = sync.pending[i];
    dispatch(updateDownloadStatus(i, 1));
    const audioExtensions = getState().config.portableAudioExtensions.split(',');
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
    .then(() => dispatch(updateDownloadStatus(i, 2)))
    .then(() => dispatch(incrPending()))
    .then(() => dispatch(importOneTrack()))
    ;
  };
}

export function getMissingTracks() {
  return (dispatch, getState) => {
    const state = getState();
    const neededIdTracks = reduce(
      state.playLists.hash,
      (m, pl) => union(m, pl.idTracks),
      []
    );
    const currentIdTracks = Object.keys(state.tracks).map(id => parseInt(id, 10));
    const missingIdTracks = difference(neededIdTracks, currentIdTracks);
    return Promise.resolve(
      missingIdTracks.length &&
      dispatch(asyncActionCreator(
        IMPORT_TRACKS,
        remote.read(`/tracks/${missingIdTracks.join(',')}`),
        { missingIdTracks }
      ))
      .then(() => dispatch(asyncActionCreator(
        SAVE_IMPORTED_TRACKS,
        local.create('/tracks', getState().sync.tracks),
        { tracks: getState().sync.tracks }
      )))
      .then(() => dispatch(getMissingAlbums()))
      .then(() => dispatch(getMissingArtists()))
      .then(() => dispatch(updateAlbumArtistMap()))
    )
    .then(() => dispatch(clearAll()))
    ;
  };
}
