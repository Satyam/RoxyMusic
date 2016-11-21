import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import Measure from 'react-measure';
import { connect } from 'react-redux';
import compose from 'recompose/compose';

import Errors from '_components/misc/errors';
import Loading from '_components/misc/loading';
import Audio from '_components/audio';
import SelectPlayList from '_components/playLists/selectPlayList';
import NowPlaying from '_components/nowPlaying';

// import { remote } from 'electron';
// const db = remote.getGlobal('db');
// console.log(db.all('select * from Albums'));

import {
  changeDimensions,
} from '_store/actions';

import styles from './app.css';

const AppComponent = ({ width, children, onMeasureChange }) => (
  <Measure onMeasure={onMeasureChange}>
    <div className={styles.app}>
      <Loading />
      <Errors />
      <SelectPlayList />
      {
        (
          width > 800
          ? (
            <div className={styles.wide}>
              <div className={styles.wideLeftPanel}>
                { children || (
                  <ul className={styles.menu}>
                    <li className={styles.menuItem}><Link to="/albums">Albums</Link></li>
                    <li className={styles.menuItem}><Link to="/artists">Artists</Link></li>
                    <li className={styles.menuItem}><Link to="/songs">Songs</Link></li>
                    <li className={styles.menuItem}><Link to="/playLists">Play Lists</Link></li>
                  </ul>
                )}
              </div>
              <div className={styles.wideRightPanel}>
                <Audio />
                <NowPlaying />
              </div>
            </div>
          )
          : (
            <div className={styles.narrow}>
              { children || (
                <ul className={styles.menu}>
                  <li className={styles.menuItem}><Link to="/albums">Albums</Link></li>
                  <li className={styles.menuItem}><Link to="/artists">Artists</Link></li>
                  <li className={styles.menuItem}><Link to="/songs">Songs</Link></li>
                  <li className={styles.menuItem}><Link to="/playLists">Play Lists</Link></li>
                  <li className={styles.menuItem}><Link to="/now">Now Playing</Link></li>
                </ul>
              )}
              <Audio />
            </div>
          )
        )
      }
    </div>
  </Measure>
);

AppComponent.propTypes = {
  width: PropTypes.number,
  children: PropTypes.node,
  onMeasureChange: PropTypes.func,
};

export const mapStateToProps = state => state.dimensions;

export const mapDispatchToProps = dispatch => ({
  onMeasureChange: dimensions => dispatch(changeDimensions(dimensions)),
});

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )
)(AppComponent);
