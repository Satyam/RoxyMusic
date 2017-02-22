import isSelector from '_jest/isSelector';
import {
  REQUEST_SENT,
  REPLY_RECEIVED,
  FAILURE_RECEIVED,
} from '_store/actions';

import reducer, { artistSelectors } from '../reducer';
import {
  GET_ARTISTS,
  GET_MORE_ARTISTS,
  GET_ARTIST,
} from '../actions';

const initialState = {
  search: '',
  list: [],
  nextOffset: 0,
  hash: {},
};

const firstList = [{
  idArtist: 6,
  artist: 'Al Stewart',
  numTracks: 1,
  idTracks: [8],
}, {
  idArtist: 65,
  artist: 'Alan Parsons & Pink Floyd',
  numTracks: 1,
  idTracks: [134],
}, {
  idArtist: 8,
  artist: 'Andrea Bocelli',
  numTracks: 2,
  idTracks: [7, 64],
}];

function indexed(list) {
  return list.reduce(
    (hash, entry) => Object.assign(hash, { [entry.idArtist]: entry }),
    {}
  );
}


const nextList = [{
  idArtist: 73,
  artist: 'Antonio Vivaldi',
  numTracks: 1,
  idTracks: [152],
}, {
  idArtist: 34,
  artist: 'Beatles John Lenon',
  numTracks: 1,
  idTracks: [28],
}, {
  idArtist: 15,
  artist: 'Bee Gees',
  numTracks: 1,
  idTracks: [23],
}];

describe('Artists reducer', () => {
  describe('reducer', () => {
    it('should return the initial state', () => {
      expect(
        reducer(undefined, {})
      ).toEqual(initialState);
      expect(artistSelectors).toEqual({});
    });
    describe('should initialize the selectors', isSelector(
      reducer,
      artistSelectors,
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
          type: GET_ARTISTS,
          stage: REQUEST_SENT,
          payload: {},
        }
      )).toEqual(initialState);
    });
    it('GET_ARTISTS should populate artists with received list', () => {
      expect(reducer(
        initialState,
        {
          type: GET_ARTISTS,
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
    it('GET_MORE_ARTISTS should add to existing', () => {
      expect(reducer(
        {
          search: '',
          nextOffset: 3,
          list: firstList,
          hash: indexed(firstList),
        },
        {
          type: GET_MORE_ARTISTS,
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
    it('GET_ARTISTS with search should populate list as before plus the search', () => {
      expect(reducer(
        initialState,
        {
          type: GET_ARTISTS,
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
    it('GET_ARTIST should read given artist', () => {
      const artistInfo = firstList[0];
      expect(reducer(
        initialState,
        {
          type: GET_ARTIST,
          stage: REPLY_RECEIVED,
          payload: artistInfo,
        }
      )).toEqual({
        search: '',
        nextOffset: 0,
        list: [artistInfo],
        hash: indexed([artistInfo]),
      });
    });
    it('GET_ARTIST may fail', () => {
      expect(reducer(
        initialState,
        {
          type: GET_ARTIST,
          stage: FAILURE_RECEIVED,
          payload: { idArtist: 42 },
          error: 999,
        }
      )).toEqual({
        search: '',
        nextOffset: 0,
        list: [],
        hash: {
          42: {
            error: 404,
            idArtist: 42,
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
      it('artistSelectors.list should return empty array', () => {
        expect(artistSelectors.list(state)).toEqual([]);
      });
      it('artistSelectors.isEmpty should return true', () => {
        expect(artistSelectors.isEmpty(state)).toBe(true);
      });
      it('artistSelectors.item should return empty object', () => {
        expect(artistSelectors.item(state, 999)).toEqual({});
      });
      it('artistSelectors.exists should return false', () => {
        expect(artistSelectors.exists(state, 999)).toBe(false);
      });
      it('artistSelectors.searchTerm should return empty string', () => {
        expect(artistSelectors.searchTerm(state)).toBe('');
      });
      it('artistSelectors.nextOffset should return 0', () => {
        expect(artistSelectors.nextOffset(state)).toBe(0);
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
      const artist = firstList[0];
      const idArtist = artist.idArtist;
      it('artistSelectors.list should return the given list', () => {
        expect(artistSelectors.list(state)).toEqual(firstList);
      });
      it('artistSelectors.isEmpty should return false', () => {
        expect(artistSelectors.isEmpty(state)).toBe(false);
      });
      it('artistSelectors.item should return empty object', () => {
        expect(artistSelectors.item(state, idArtist)).toEqual(artist);
      });
      it('artistSelectors.exists should return true', () => {
        expect(artistSelectors.exists(state, idArtist)).toBe(true);
      });
      it('artistSelectors.searchTerm should return abc', () => {
        expect(artistSelectors.searchTerm(state)).toBe('abc');
      });
      it('artistSelectors.nextOffset should return 3', () => {
        expect(artistSelectors.nextOffset(state)).toBe(3);
      });
    });
  });
});
