import React from 'react';
import { Route } from 'react-router';

import NowPlaying from './';

export default path => (
  <Route>
    <Route path={path} component={NowPlaying} />
  </Route>
);
