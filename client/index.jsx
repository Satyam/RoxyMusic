import React from 'react';
import { render } from 'react-dom';
import { Router, browserHistory, createMemoryHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { Provider } from 'react-redux';

import createStore from '_store/createStore';

import routes from '_components/routes';
import { getAllConfig } from '_store/actions';

export default function (initialState) {
  if (process.env.NODE_ENV !== 'production' && BUNDLE !== 'cordova') {
    /* eslint-disable import/no-extraneous-dependencies, global-require */
    window.Perf = require('react-addons-perf');
    /* eslint-enable import/no-extraneous-dependencies, global-require */
  }

  const baseHistory = (
    (BUNDLE === 'electronClient' || BUNDLE === 'cordova')
    ? createMemoryHistory()
    : browserHistory
  );

  const store = createStore(baseHistory, initialState);

  const history = syncHistoryWithStore(baseHistory, store);

  store.dispatch(getAllConfig())
  .then(() => render(
    (
      <Provider store={store}>
        <Router history={history}>
          {routes('/')}
        </Router>
      </Provider>
    ),
    document.getElementById('contents')
  ));

  return store;
}
