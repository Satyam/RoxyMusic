import React from 'react';
import { Route } from 'react-router';

import Track from '_components/tracks/track';
import SongList from './songList';

export default path => (
  <Route>
    <Route path={`${path}/:idTrack`} component={Track} />
    <Route path={path} component={SongList} />
  </Route>
);
