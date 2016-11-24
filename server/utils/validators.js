const failRequest = message => Promise.reject({
  code: 400,
  message: `Bad Request: ${message}`,
});

const testIdTracks = /^\d+(,\d+)*$/;
const testInteger = /^\d+$/;

export function isIntegerKey(o, which) {
  const id = o.keys[which];
  if (id && !testInteger.test(id)) {
    return failRequest(`${which} should be an integer`);
  }
  return o;
}

export function idTracks(o) {
  const id = o.keys.idTracks;
  if (id && !testIdTracks.test(id)) {
    return failRequest('idTracks should be a comma separated sequence of integers');
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
