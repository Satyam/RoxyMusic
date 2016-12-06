import React from 'react';
import { render } from 'react-dom';
import { Router, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { Provider } from 'react-redux';

import createStore from '_store/createStore';

import routes from '_components/routes';

export default function () {
  if (process.env.NODE_ENV !== 'production' && BUNDLE !== 'phonegap') {
    /* eslint-disable import/no-extraneous-dependencies, global-require */
    window.Perf = require('react-addons-perf');
    /* eslint-enable import/no-extraneous-dependencies, global-require */
  }

  const store = createStore(browserHistory);

  const history = syncHistoryWithStore(browserHistory, store);

  if (BUNDLE === 'electronClient') {
    browserHistory.replace('/');
  }

  const dest = document.getElementById('contents');

  render((
    <Provider store={store}>
      <Router history={history}>
        {routes('/')}
      </Router>
    </Provider>
  ), dest);

  return store;
}
