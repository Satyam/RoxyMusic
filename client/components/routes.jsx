import React from 'react';
import { Route } from 'react-router';

import App from './app';
import NotFound from './misc/notFound';

import albums from './albums/routes';
import artists from './artists/routes';
import songs from './songs/routes';
import playLists from './playLists/routes';
import nowPlaying from './nowPlaying/routes';
import sync from './sync/routes';
import config from './config/routes';

export default path => (
  <Route path={path} component={App}>
    {albums('albums')}
    {artists('artists')}
    {songs('songs')}
    {playLists('playLists')}
    {nowPlaying('now')}
    {sync('sync')}
    {config('config')}
    <Route path="*" component={NotFound} />
  </Route>
);
