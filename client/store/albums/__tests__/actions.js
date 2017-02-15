import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nock from 'nock';

import {
  REQUEST_SENT,
  REPLY_RECEIVED,
} from '_store/actions';

import * as actions from '../actions';

require('isomorphic-fetch');

jest.mock('_store/selectors.js', () => ({
  albumSelectors: {
    searchTerm: jest.fn(state => state.search),
    nextOffset: jest.fn(state => state.nextOffset),
  },
}));

const mockStore = configureMockStore([thunk]);

describe('Album store actions', () => {
  afterEach(() => {
    nock.cleanAll();
  });
  describe('getAlbums', () => {
    it('plain', () => {
      const store = mockStore({});
      nock(`${HOST}:${PORT}`)
        .get(`${REST_API_PATH}/albums/`)
        .reply(200, { list: [] });
      return store.dispatch(actions.getAlbums())
      .then((response) => {
        expect(response).toEqual({
          type: actions.GET_ALBUMS,
          stage: REPLY_RECEIVED,
          payload: {
            list: [],
            search: undefined,
          },
          meta: undefined,
        });
      })
      .then(() => {
        expect(store.getActions()).toEqual([
          { type: actions.GET_ALBUMS,
            stage: REQUEST_SENT,
            payload: {
              search: undefined,
            },
            meta: undefined,
          },
          { type: actions.GET_ALBUMS,
            stage: REPLY_RECEIVED,
            payload: {
              list: [],
              search: undefined,
            },
            meta: undefined,
          },
        ]);
      });
    });
    it('with search', () => {
      const store = mockStore({});
      nock(`${HOST}:${PORT}`)
        .get(`${REST_API_PATH}/albums/?search=abc`)
        .reply(200, { list: [] });
      return store.dispatch(actions.getAlbums('abc'))
      .then((response) => {
        expect(response).toEqual({
          type: actions.GET_ALBUMS,
          stage: REPLY_RECEIVED,
          payload: {
            list: [],
            search: 'abc',
          },
          meta: undefined,
        });
      })
      .then(() => {
        expect(store.getActions()).toEqual([
          { type: actions.GET_ALBUMS,
            stage: REQUEST_SENT,
            payload: { search: 'abc' },
            meta: undefined,
          },
          { type: actions.GET_ALBUMS,
            stage: REPLY_RECEIVED,
            payload: {
              list: [],
              search: 'abc',
            },
            meta: undefined,
          },
        ]);
      });
    });
  });
  describe('getMoreAlbums', () => {
    it('plain', () => {
      const store = mockStore({
        search: '',
        nextOffset: 20,
      });
      nock(`${HOST}:${PORT}`)
        .get(`${REST_API_PATH}/albums/?search=&offset=20`)
        .reply(200, { list: [] });
      return store.dispatch(actions.getMoreAlbums())
      .then((response) => {
        expect(response).toEqual({
          type: actions.GET_MORE_ALBUMS,
          stage: REPLY_RECEIVED,
          payload: {
            list: [],
            search: '',
            offset: 20,
          },
          meta: undefined,
        });
      })
      .then(() => {
        expect(store.getActions()).toEqual([
          { type: actions.GET_MORE_ALBUMS,
            stage: REQUEST_SENT,
            payload: {
              search: '',
              offset: 20,
            },
            meta: undefined,
          },
          { type: actions.GET_MORE_ALBUMS,
            stage: REPLY_RECEIVED,
            payload: {
              list: [],
              search: '',
              offset: 20,
            },
            meta: undefined,
          },
        ]);
      });
    });
    it('with search', () => {
      const store = mockStore({
        search: 'abc',
        nextOffset: 20,
      });
      nock(`${HOST}:${PORT}`)
        .get(`${REST_API_PATH}/albums/?search=abc&offset=20`)
        .reply(200, { list: [] });
      return store.dispatch(actions.getMoreAlbums())
      .then((response) => {
        expect(response).toEqual({
          type: actions.GET_MORE_ALBUMS,
          stage: REPLY_RECEIVED,
          payload: {
            list: [],
            search: 'abc',
            offset: 20,
          },
          meta: undefined,
        });
      })
      .then(() => {
        expect(store.getActions()).toEqual([
          { type: actions.GET_MORE_ALBUMS,
            stage: REQUEST_SENT,
            payload: {
              search: 'abc',
              offset: 20,
            },
            meta: undefined,
          },
          { type: actions.GET_MORE_ALBUMS,
            stage: REPLY_RECEIVED,
            payload: {
              list: [],
              search: 'abc',
              offset: 20,
            },
            meta: undefined,
          },
        ]);
      });
    });
  });
  describe('getAlbum', () => {
    it('plain', () => {
      const store = mockStore({});
      const album = {
        idAlbum: 42,
        album: '...But Seriously',
        artists: 'Phil Collins',
        idArtist: 25,
        numTracks: 2,
        idTracks: [71, 74],
      };
      const idAlbum = album.idAlbum;

      nock(`${HOST}:${PORT}`)
        .get(`${REST_API_PATH}/albums/${idAlbum}`)
        .reply(200, album);
      return store.dispatch(actions.getAlbum(idAlbum))
      .then((response) => {
        expect(response).toEqual({
          type: actions.GET_ALBUM,
          stage: REPLY_RECEIVED,
          payload: album,
          meta: undefined,
        });
      })
      .then(() => {
        expect(store.getActions()).toEqual([
          { type: actions.GET_ALBUM,
            stage: REQUEST_SENT,
            payload: { idAlbum },
            meta: undefined,
          },
          { type: actions.GET_ALBUM,
            stage: REPLY_RECEIVED,
            payload: album,
            meta: undefined,
          },
        ]);
      });
    });
  });
});
