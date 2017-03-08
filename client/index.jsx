import React from 'react';
import { render } from 'react-dom';
import { Router, browserHistory, createMemoryHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { Provider } from 'react-redux';

import createStore from '_store/createStore';

import routes from '_components/routes';

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

  const dest = document.getElementById('contents');

  render(
    (
      <Provider store={store}>
        <Router history={history}>
          {routes('/')}
        </Router>
      </Provider>
    ),
    dest
  );
  if (BUNDLE === 'webClient' && process.env.NODE_ENV !== 'production') {
    if (
      !dest ||
      !dest.firstChild ||
      !dest.firstChild.attributes ||
      !dest.firstChild.attributes['data-react-checksum']
    ) {
      console.error('Server-side React render was discarded. Make sure that your initial render does not contain any client-side code.'); // eslint-disable-line
    }
  }

  return store;
}
