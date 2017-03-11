import React, { Component } from 'react';
import { renderToString } from 'react-dom/server';
import { createMemoryHistory, match, RouterContext } from 'react-router';
import { Provider } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';

import createStore from '_store/createStore';
import clientRoutes from '_components/routes';

import htmlTemplate from './htmlTemplate';

require('isomorphic-fetch');

export default function universalWebApp(req, res, next) {
  const memoryHistory = createMemoryHistory(req.url);
  const store = createStore(memoryHistory);
  const history = syncHistoryWithStore(memoryHistory, store);
  match(
    { history, routes: clientRoutes('/'), location: req.url },
    (err, redirectLocation, renderProps) => {
      if (err) {
        console.error(err);
        res.status(500).end('Internal server error');
      } else if (redirectLocation) {
        res.redirect(302, redirectLocation.pathname + redirectLocation.search);
      } else if (renderProps) {
        if (renderProps.routes.find(route => route.path === '*')) {
          next();
        } else {
          const initializeComponent = (component) => {
            let storeInitializer;
            if (component) {
              if (component.getStoreInitializer) {
                storeInitializer = component.getStoreInitializer();
              } else if (typeof component === 'function' && !(component.prototype instanceof Component)) {
                storeInitializer = component;
              }
              if (typeof storeInitializer === 'function') {
                return storeInitializer(store.dispatch, store.getState, renderProps);
              } else if (Array.isArray(storeInitializer)) {
                return Promise.all(storeInitializer.map(initializeComponent));
              }
            }
            return null;
          };
          Promise.all(renderProps.components.map(initializeComponent))
          .then(() => {
            const finalState = JSON.stringify(store.getState());
            const initialView = renderToString(
              <Provider store={store}>
                <RouterContext {...renderProps} />
              </Provider>
            );
            res.status(200).type('html').end(htmlTemplate(initialView, finalState));
          })
          .catch((reason) => {
            console.error(reason);
            res.status(500).end(`Internal server error \n${reason}`);
          });
        }
      } else {
        next();
      }
    }
  );
}
