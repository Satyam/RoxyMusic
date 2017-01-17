import React, { PropTypes } from 'react';
import { Link } from 'react-router';
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

import styles from './app.css';

const AppComponent = ({ wide, children }) => (
  <div className={styles.app}>
    <Navbar>
      <Navbar.Header>
        <Navbar.Brand>
          <Icon type="music" label="Roxy Music" href="/" title="home" />
        </Navbar.Brand>
      </Navbar.Header>
      <Nav pullRight>
        {
          BUNDLE === 'cordova'
          ? (
            <NavItem>
              <Icon type="retweet" href="/sync" title="sync" />
            </NavItem>
          )
          : null
      }
      </Nav>
    </Navbar>
    <Loading />
    <Errors />
    <SelectPlayList />
    {
      (
        wide
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
);

AppComponent.propTypes = {
  wide: PropTypes.bool,
  children: PropTypes.node,
};

export const mapStateToProps = state => state.config;

export default compose(
  connect(
    mapStateToProps
  )
)(AppComponent);
