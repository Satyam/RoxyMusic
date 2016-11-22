import { failRequest } from './handleRequest';

const testIdTracks = /^\d+(,\d+)*$/;
const testInteger = /^\d+$/;

/* eslint-disable no-param-reassign, consistent-return */
export function isInteger(id) {
  if (id && !testInteger.test(id)) {
    return failRequest(400, 'Bad Request');
  }
}

export function idTracks(o) {
  const id = o.keys.idTracks;
  if (id && !testIdTracks.test(id)) {
    return failRequest(400, 'Bad Request');
  }
}

export function idAlbum(o) {
  return isInteger(o.keys.idAlbum);
}

export function idArtist(o) {
  return isInteger(o.keys.idArtist);
}

export function idPlayList(o) {
  return isInteger(o.keys.idPlayList);
}
