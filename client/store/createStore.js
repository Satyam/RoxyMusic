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
import config from './config';
import sync from './sync';

const reducers = combineReducers({
  albums,
  tracks,
  artists,
  songs,
  requests,
  playLists,
  nowPlaying,
  config,
  sync,
  routing: routerReducer,
});

export default (history, initialState) => {
  let enhancer = applyMiddleware(reduxThunk, routerMiddleware(history));
  if (process.env.NODE_ENV !== 'production') {
    if (BUNDLE === 'cordova') {
      enhancer = applyMiddleware(
        reduxThunk,
        routerMiddleware(history),
        /* eslint-disable global-require */
        require('_utils/reduxLogger').default
        /* eslint-enable global-require */
      );
    } else if (typeof window !== 'undefined' && window.devToolsExtension) {
      enhancer = compose(enhancer, window.devToolsExtension());
    }
  }
  return createStore(
    reducers,
    initialState,
    enhancer
  );
};
