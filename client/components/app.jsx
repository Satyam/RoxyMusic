import React, { PropTypes } from 'react';

import Errors from '_components/errors';
import Loading from '_components/loading';
import Audio from '_components/audio';
import NowPlaying from '_components/nowPlaying';
import { Link } from 'react-router';
import styles from './app.css';

const App = ({ children }) => (
  <div className={styles.app}>
    <Loading />
    <Errors />
    {
      (
        BUNDLE === 'client'
        ? (
          <div className={styles.desktopMain}>
            <div className={styles.leftPanel}>
              { children || (
                <ul className={styles.mainMenu}>
                  <li className={styles.menuItem}><Link to="/albums">Albums</Link></li>
                  <li className={styles.menuItem}><Link to="/artists">Artists</Link></li>
                  <li className={styles.menuItem}><Link to="/playLists">Play Lists</Link></li>
                </ul>
              )}
            </div>
            <div className={styles.rightPanel}>
              <Audio />
              <NowPlaying />
            </div>
          </div>
        )
        : (
          <div className={styles.tablet}>
            { children || (
              <ul className={styles.tabletMain}>
                <li className={styles.menuItem}><Link to="/albums">Albums</Link></li>
                <li className={styles.menuItem}><Link to="/artists">Artists</Link></li>
                <li className={styles.menuItem}><Link to="/now">Now Playing</Link></li>
              </ul>
            )}
            <Audio />
          </div>
        )
      )
    }
  </div>
);

App.propTypes = {
  children: PropTypes.node,
};

export default App;
