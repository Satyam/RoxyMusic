import React from 'react';
import { render } from 'react-dom';
import { Router, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { Provider } from 'react-redux';

import createStore from '_store/createStore';

import components from '_components';

if (process.env.NODE_ENV !== 'production') {
  /* eslint-disable import/no-extraneous-dependencies, global-require */
  window.Perf = require('react-addons-perf');
  /* eslint-enable import/no-extraneous-dependencies, global-require */
}

export const store = createStore(browserHistory);

const history = syncHistoryWithStore(browserHistory, store);

const dest = document.getElementById('contents');

export default render((
  <Provider store={store}>
    <Router history={history}>
      {components('/')}
    </Router>
  </Provider>
), dest);
