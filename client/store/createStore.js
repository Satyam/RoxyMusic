import { combineReducers, createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware, routerReducer } from 'react-router-redux';
import reduxThunk from 'redux-thunk';

import albums from './albums';
import tracks from './tracks';
import artists from './artists';
import songs from './songs';
import playLists from './playLists';
import nowPlaying from './nowPlaying';
import requests from './requests';

const reducers = combineReducers({
  albums,
  tracks,
  artists,
  songs,
  requests,
  playLists,
  nowPlaying,
  routing: routerReducer,
});

export default (history, initialState) => {
  const mw = applyMiddleware(reduxThunk, routerMiddleware(history));
  return createStore(
    reducers,
    initialState,
    process.env.NODE_ENV !== 'production' &&
    typeof window !== 'undefined' &&
    window.devToolsExtension
    ? compose(mw, window.devToolsExtension())
    : mw
  );
};
