import React from 'react';
import { Route } from 'react-router';

import App from './app';
import NotFound from './notFound';

import albums from './albums/routes';
// import nowPlaying from './nowPlaying/routes';
import playLists from './playLists/routes';

export default path => (
  <Route path={path} component={App}>
    {albums('albums')}
    {/* nowPlaying('now')  */}
    {playLists('playLists')}
    <Route path="*" component={NotFound} />
  </Route>
);
