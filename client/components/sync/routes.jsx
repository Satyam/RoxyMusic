import React from 'react';
import { Route } from 'react-router';

import Sync from './sync';
import PlayListsCompare from './playListsCompare';
import TransferPlayLists from './transferPlayLists';
import ImportCatalogInfo from './importCatalogInfo';
import TransferFiles from './transferFiles';

export default path => (
  <Route>
    <Route path={`${path}/PlayListsCompare`} component={PlayListsCompare} />
    <Route path={`${path}/TransferPlayLists`} component={TransferPlayLists} />
    <Route path={`${path}/ImportCatalogInfo`} component={ImportCatalogInfo} />
    <Route path={`${path}/TransferFiles`} component={TransferFiles} />
    <Route path={path} component={Sync} />
  </Route>
);
