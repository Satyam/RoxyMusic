import React from 'react';
import { Route } from 'react-router';

import Sync from './sync';
import Sync1 from './playListsCompare';

export default path => (
  <Route>
    <Route path={`${path}/1`} component={Sync1} />
    <Route path={path} component={Sync} />
  </Route>
);
