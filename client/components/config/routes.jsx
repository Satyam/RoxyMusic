import React from 'react';
import { Route } from 'react-router';

import Config from './';

export default path => (
  <Route>
    <Route path={path} component={Config} />
  </Route>
);
