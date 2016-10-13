import restAPI from '_utils/restAPI';
import asyncActionCreator from '_utils/asyncActionCreator';

const api = restAPI('music/albums');

export const GET_ALBUMS = 'albums/get albums';
export const GET_ALBUM = 'albums/get album';

export function getAlbums(offset = 0, count = 20) {
  return asyncActionCreator(
    GET_ALBUMS,
    api.read(`?offset=${offset}&count=${count}`),
    { offset, count }
  );
}

export function getAlbum(idAlbum) {
  return asyncActionCreator(
    GET_ALBUM,
    api.read(idAlbum),
    { idAlbum }
  );
}
