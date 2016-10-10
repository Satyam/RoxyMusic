import React from 'react';
import { Route } from 'react-router';

import App from './app';
import NotFound from './notFound';

import albums from './albums';

export default path => (
  <Route path={path} component={App}>
    {albums('albums')}
    <Route path="*" component={NotFound} />
  </Route>
);
