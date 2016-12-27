import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import Measure from 'react-measure';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import Navbar from 'react-bootstrap/lib/Navbar';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import Icon from '_components/misc/icon';

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
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>
            <Icon type="music" href="/" label="Roxy Music" />
          </Navbar.Brand>
        </Navbar.Header>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav pullRight>
            <NavItem href="/sync">
              <Icon type="retweet" title="sync" />
            </NavItem>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
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
                  <div className={styles.menu}>
                    <Link className={styles.menuItem} to="/albums">Albums</Link>
                    <Link className={styles.menuItem} to="/artists">Artists</Link>
                    <Link className={styles.menuItem} to="/songs">Songs</Link>
                    <Link className={styles.menuItem} to="/playLists">Play Lists</Link>
                  </div>
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
                  <Link className={styles.menuItem} to="/albums">Albums</Link>
                  <Link className={styles.menuItem} to="/artists">Artists</Link>
                  <Link className={styles.menuItem} to="/songs">Songs</Link>
                  <Link className={styles.menuItem} to="/playLists">Play Lists</Link>
                  <Link className={styles.menuItem} to="/now">Now Playing</Link>
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
