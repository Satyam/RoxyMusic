import isSelector from '_jest/isSelector';
import {
  REQUEST_SENT,
  REPLY_RECEIVED,
  FAILURE_RECEIVED,
} from '_store/actions';

import reducer, { albumSelectors } from '../reducer';
import {
  GET_ALBUMS,
  GET_MORE_ALBUMS,
  GET_ALBUM,
} from '../actions';

const initialState = {
  search: '',
  list: [],
  nextOffset: 0,
  hash: {},
};

const firstList = [{
  idAlbum: 42,
  album: '...But Seriously',
  artists: 'Phil Collins',
  idArtist: 25,
  numTracks: 2,
  idTracks: [71, 74],
}, {
  idAlbum: 49,
  album: '300',
  artists: 'Soundtrack',
  idArtist: 13,
  numTracks: 1,
  idTracks: [124],
}, {
  idAlbum: 56,
  album: '70\'s',
  artists: null,
  idArtist: null,
  numTracks: 1,
  idTracks: [159],
}];

function indexed(list) {
  return list.reduce(
    (hash, entry) => Object.assign(hash, { [entry.idAlbum]: entry }),
    {}
  );
}


const nextList = [{
  idAlbum: 64,
  album: 'Alegria',
  artists: 'Cirque Du Soleil',
  idArtist: 2,
  numTracks: 13,
  idTracks: [196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 293],
}, {
  idAlbum: 1,
  album: 'Ammonia Avenue',
  artists: 'The Alan Parsons Project',
  idArtist: 1,
  numTracks: 1,
  idTracks: [4],
}, {
  idAlbum: 52,
  album: 'Another brick in the wall',
  artists: 'Pink Floyd',
  idArtist: 64,
  numTracks: 1,
  idTracks: [135],
}];

describe('Albums reducer', () => {
  describe('reducer', () => {
    it('should return the initial state', () => {
      expect(
        reducer(undefined, {})
      ).toEqual(initialState);
      expect(albumSelectors).toEqual({});
    });
    describe('should initialize the selectors', isSelector(
      reducer,
      albumSelectors,
      [
        'list',
        'isEmpty',
        'item',
        'exists',
        'searchTerm',
        'nextOffset',
      ],
      initialState
    ));
    it('should ignore requests sent', () => {
      expect(reducer(
        initialState,
        {
          type: GET_ALBUMS,
          stage: REQUEST_SENT,
          payload: {},
        }
      )).toEqual(initialState);
    });
    it('GET_ALBUMS should populate albums with received list', () => {
      expect(reducer(
        initialState,
        {
          type: GET_ALBUMS,
          stage: REPLY_RECEIVED,
          payload: {
            list: firstList,
          },
        }
      )).toEqual({
        search: '',
        nextOffset: 3,
        list: firstList,
        hash: indexed(firstList),
      });
    });
    it('GET_MORE_ALBUMS should add to existing', () => {
      expect(reducer(
        {
          search: '',
          nextOffset: 3,
          list: firstList,
          hash: indexed(firstList),
        },
        {
          type: GET_MORE_ALBUMS,
          stage: REPLY_RECEIVED,
          payload: {
            list: nextList,
          },
        }
      )).toEqual({
        search: '',
        nextOffset: 6,
        list: firstList.concat(nextList),
        hash: indexed(firstList.concat(nextList)),
      });
    });
    it('GET_ALBUMS with search should populate list as before plus the search', () => {
      expect(reducer(
        initialState,
        {
          type: GET_ALBUMS,
          stage: REPLY_RECEIVED,
          payload: {
            list: firstList,
            search: 'abc',
          },
        }
      )).toEqual({
        search: 'abc',
        nextOffset: 3,
        list: firstList,
        hash: indexed(firstList),
      });
    });
    it('GET_ALBUM should read given album', () => {
      const albumInfo = firstList[0];
      expect(reducer(
        initialState,
        {
          type: GET_ALBUM,
          stage: REPLY_RECEIVED,
          payload: albumInfo,
        }
      )).toEqual({
        search: '',
        nextOffset: 0,
        list: [albumInfo],
        hash: indexed([albumInfo]),
      });
    });
    it('GET_ALBUM may fail', () => {
      expect(reducer(
        initialState,
        {
          type: GET_ALBUM,
          stage: FAILURE_RECEIVED,
          payload: { idAlbum: 42 },
          error: 999,
        }
      )).toEqual({
        search: '',
        nextOffset: 0,
        list: [],
        hash: {
          42: {
            error: 404,
            idAlbum: 42,
          },
        },
      });
    });
  });
  describe('selectors', () => {
    beforeAll(() => {
      reducer(undefined, {
        type: '@@selectors',
        key: 'xyz',
      });
    });
    describe('empty state', () => {
      const state = {
        xyz: initialState,
      };
      it('albumSelectors.list should return empty array', () => {
        expect(albumSelectors.list(state)).toEqual([]);
      });
      it('albumSelectors.isEmpty should return true', () => {
        expect(albumSelectors.isEmpty(state)).toBe(true);
      });
      it('albumSelectors.item should return empty object', () => {
        expect(albumSelectors.item(state, 999)).toEqual({});
      });
      it('albumSelectors.exists should return false', () => {
        expect(albumSelectors.exists(state, 999)).toBe(false);
      });
      it('albumSelectors.searchTerm should return empty string', () => {
        expect(albumSelectors.searchTerm(state)).toBe('');
      });
      it('albumSelectors.nextOffset should return 0', () => {
        expect(albumSelectors.nextOffset(state)).toBe(0);
      });
    });
    describe('non-empty state', () => {
      const state = {
        xyz: {
          search: 'abc',
          nextOffset: 3,
          list: firstList,
          hash: indexed(firstList),
        },
      };
      const album = firstList[0];
      const idAlbum = album.idAlbum;
      it('albumSelectors.list should return the given list', () => {
        expect(albumSelectors.list(state)).toEqual(firstList);
      });
      it('albumSelectors.isEmpty should return false', () => {
        expect(albumSelectors.isEmpty(state)).toBe(false);
      });
      it('albumSelectors.item should return empty object', () => {
        expect(albumSelectors.item(state, idAlbum)).toEqual(album);
      });
      it('albumSelectors.exists should return true', () => {
        expect(albumSelectors.exists(state, idAlbum)).toBe(true);
      });
      it('albumSelectors.searchTerm should return abc', () => {
        expect(albumSelectors.searchTerm(state)).toBe('abc');
      });
      it('albumSelectors.nextOffset should return 3', () => {
        expect(albumSelectors.nextOffset(state)).toBe(3);
      });
    });
  });
});
