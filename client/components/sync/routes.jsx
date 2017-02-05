import React from 'react';
import { Route } from 'react-router';

import Sync from './sync';
import PlayListsCompare from './playListsCompare';
import PlayListDiff from './playListDiff';
import TransferPlayLists from './transferPlayLists';
import ImportCatalogInfo from './importCatalogInfo';
import TransferFiles from './transferFiles';
import AllDone from './allDone';

export default path => (
  <Route>
    <Route path={`${path}/PlayListsCompare`} component={PlayListsCompare} />
    <Route path={`${path}/PlayListDiff/:idPlayList`} component={PlayListDiff} />
    <Route path={`${path}/TransferPlayLists`} component={TransferPlayLists} />
    <Route path={`${path}/ImportCatalogInfo`} component={ImportCatalogInfo} />
    <Route path={`${path}/TransferFiles`} component={TransferFiles} />
    <Route path={`${path}/AllDone`} component={AllDone} />
    <Route path={`${path}/PlayListDiff`} component={PlayListDiff} />
    <Route path={path} component={Sync} />
  </Route>
);
