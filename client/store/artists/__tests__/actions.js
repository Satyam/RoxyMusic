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
  artistSelectors: {
    searchTerm: jest.fn(state => state.search),
    nextOffset: jest.fn(state => state.nextOffset),
  },
}));

const mockStore = configureMockStore([thunk]);

describe('Artist store actions', () => {
  afterEach(() => {
    nock.cleanAll();
  });
  describe('getArtists', () => {
    it('plain', () => {
      const store = mockStore({});
      nock(`${HOST}:${PORT}`)
        .get(`${REST_API_PATH}/artists/`)
        .reply(200, { list: [] });
      return store.dispatch(actions.getArtists())
      .then((response) => {
        expect(response).toEqual({
          type: actions.GET_ARTISTS,
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
          { type: actions.GET_ARTISTS,
            stage: REQUEST_SENT,
            payload: {
              search: undefined,
            },
            meta: undefined,
          },
          { type: actions.GET_ARTISTS,
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
        .get(`${REST_API_PATH}/artists/?search=abc`)
        .reply(200, { list: [] });
      return store.dispatch(actions.getArtists('abc'))
      .then((response) => {
        expect(response).toEqual({
          type: actions.GET_ARTISTS,
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
          { type: actions.GET_ARTISTS,
            stage: REQUEST_SENT,
            payload: { search: 'abc' },
            meta: undefined,
          },
          { type: actions.GET_ARTISTS,
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
  describe('getMoreArtists', () => {
    it('plain', () => {
      const store = mockStore({
        search: '',
        nextOffset: 20,
      });
      nock(`${HOST}:${PORT}`)
        .get(`${REST_API_PATH}/artists/?search=&offset=20`)
        .reply(200, { list: [] });
      return store.dispatch(actions.getMoreArtists())
      .then((response) => {
        expect(response).toEqual({
          type: actions.GET_MORE_ARTISTS,
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
          { type: actions.GET_MORE_ARTISTS,
            stage: REQUEST_SENT,
            payload: {
              search: '',
              offset: 20,
            },
            meta: undefined,
          },
          { type: actions.GET_MORE_ARTISTS,
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
        .get(`${REST_API_PATH}/artists/?search=abc&offset=20`)
        .reply(200, { list: [] });
      return store.dispatch(actions.getMoreArtists())
      .then((response) => {
        expect(response).toEqual({
          type: actions.GET_MORE_ARTISTS,
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
          { type: actions.GET_MORE_ARTISTS,
            stage: REQUEST_SENT,
            payload: {
              search: 'abc',
              offset: 20,
            },
            meta: undefined,
          },
          { type: actions.GET_MORE_ARTISTS,
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
  describe('getArtist', () => {
    it('plain', () => {
      const store = mockStore({});
      const artist = {
        idAlbum: 42,
        album: '...But Seriously',
        artists: 'Phil Collins',
        idArtist: 25,
        numTracks: 2,
        idTracks: [71, 74],
      };
      const idArtist = artist.idArtist;

      nock(`${HOST}:${PORT}`)
        .get(`${REST_API_PATH}/artists/${idArtist}`)
        .reply(200, artist);
      return store.dispatch(actions.getArtist(idArtist))
      .then((response) => {
        expect(response).toEqual({
          type: actions.GET_ARTIST,
          stage: REPLY_RECEIVED,
          payload: artist,
          meta: undefined,
        });
      })
      .then(() => {
        expect(store.getActions()).toEqual([
          { type: actions.GET_ARTIST,
            stage: REQUEST_SENT,
            payload: { idArtist },
            meta: undefined,
          },
          { type: actions.GET_ARTIST,
            stage: REPLY_RECEIVED,
            payload: artist,
            meta: undefined,
          },
        ]);
      });
    });
  });
});
