import
  installExtension,
  {
    REACT_DEVELOPER_TOOLS,
    REDUX_DEVTOOLS,
  } from 'electron-devtools-installer';

import client from '_client';

installExtension(REACT_DEVELOPER_TOOLS)
  .then(() => installExtension(REDUX_DEVTOOLS))
  .then(() => client())
  .catch(err => console.log('An error occurred: ', err));
