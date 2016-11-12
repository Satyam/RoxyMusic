import { failRequest } from '_server/utils';

const testIdTracks = /^\d+(,\d+)*$/;
const testInteger = /^\d+$/;

/* eslint-disable no-param-reassign, consistent-return */
export function validateIdTracks(o) {
  const idTracks = o.keys.idTracks;
  if (idTracks && !testIdTracks.test(idTracks)) {
    return failRequest(400, 'Bad Request');
  }
}

export function validateIdAlbum(o) {
  const idAlbum = o.keys.idAlbum;
  if (idAlbum && !testInteger.test(idAlbum)) {
    return failRequest(400, 'Bad Request');
  }
}

export function validateIdArtist(o) {
  const idArtist = o.keys.idArtist;
  if (idArtist && !testInteger.test(idArtist)) {
    return failRequest(400, 'Bad Request');
  }
}

export function validateIdPlayList(o) {
  const idPlayList = o.keys.idPlayList;
  if (idPlayList && !testInteger.test(idPlayList)) {
    return failRequest(400, 'Bad Request');
  }
}
