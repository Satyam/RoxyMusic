import React from 'react';
import { Route } from 'react-router';

import Sync from './sync';

export default path => (
  <Route>
    <Route path={path} component={Sync} />
  </Route>
);
