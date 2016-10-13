import React, { PropTypes } from 'react';

import Errors from '_components/errors';
import Loading from '_components/loading';
import Menu from '_components/menu';
import Audio from '_components/audio';

const App = ({ children }) => (
  <div className="app">
    <Loading />
    <Errors />
    <Menu
      menuItems={{
        albums: {
          icon: 'cd',
          caption: 'Albums',
        },
      }}
    />
    {children}
    <Audio />
  </div>
);

App.propTypes = {
  children: PropTypes.node,
};

export default App;
