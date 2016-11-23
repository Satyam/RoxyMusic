import { failRequest } from './handleRequest';

const testIdTracks = /^\d+(,\d+)*$/;
const testInteger = /^\d+$/;

export function isIntegerKey(o, which) {
  const id = o.keys[which];
  if (id && !testInteger.test(id)) {
    return failRequest(400, 'Bad Request');
  }
  return o;
}

export function idTracks(o) {
  const id = o.keys.idTracks;
  if (id && !testIdTracks.test(id)) {
    return failRequest(400, 'Bad Request');
  }
  return o;
}

export function idAlbum(o) {
  return isIntegerKey(o, 'idAlbum');
}

export function idArtist(o) {
  return isIntegerKey(o, 'idArtist');
}

export function idPlayList(o) {
  return isIntegerKey(o, 'idPlayList');
}
