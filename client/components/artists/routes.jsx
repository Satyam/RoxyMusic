import React from 'react';
import { Route } from 'react-router';

import ArtistList from './artistList';
import Artist from './artist';

export default path => (
  <Route>
    <Route path={`${path}/:idArtist`} component={Artist} />
    <Route path={path} component={ArtistList} />
  </Route>
);
