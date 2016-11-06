import React from 'react';
import { Route } from 'react-router';

import PlayLists from './playLists';
import PlayList from './playList';

export default path => (
  <Route>
    <Route path={`${path}/:idPlayList`} component={PlayList} />
    <Route path={path} component={PlayLists} />
  </Route>
);
