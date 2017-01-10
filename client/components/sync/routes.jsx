import React from 'react';
import { Route } from 'react-router';

import Sync from './sync';
import PlayListsCompare from './playListsCompare';
import TransferFiles from './transferFiles';

export default path => (
  <Route>
    <Route path={`${path}/1`} component={PlayListsCompare} />
    <Route path={`${path}/2`} component={TransferFiles} />
    <Route path={path} component={Sync} />
  </Route>
);
