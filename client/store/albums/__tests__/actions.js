import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nock from 'nock';

import {
  REQUEST_SENT,
  REPLY_RECEIVED,
} from '_store/actions';

import * as actions from '../actions';

require('isomorphic-fetch');

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
});
