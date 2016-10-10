import React from 'react';
import { Route } from 'react-router';

import AlbumList from './albumList';
import Album from './album';

export default path => (
  <Route path={path} component={AlbumList}>
    <Route path=":idAlbum" component={Album} />
  </Route>
);
