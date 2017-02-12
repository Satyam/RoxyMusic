import React from 'react';
import { Route } from 'react-router';

import SongList from './songList';

export default path => (
  <Route>
    <Route path={path} component={SongList} />
  </Route>
);
