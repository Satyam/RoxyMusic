import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import Navbar from 'react-bootstrap/lib/Navbar';
import Icon from '_components/misc/icon';
import FoldingToolbar from '_components/misc/foldingToolbar';

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
          <Icon type="heart,music" label="Roxy Music" href="/" title="home" />
        </Navbar.Brand>
      </Navbar.Header>
      <FoldingToolbar>
        {
          BUNDLE === 'cordova'
          ? (
            <Icon button type="retweet" href="/sync" title="Synchonize" />
          )
          : null
        }
        <Icon button type="cog" href="/config" title="Configure" />
      </FoldingToolbar>
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
                  <Icon
                    button="primary"
                    block
                    type="cd"
                    className={styles.menuItem}
                    href="/albums"
                  >Albums</Icon>
                  <Icon
                    button="primary"
                    block
                    type="user"
                    className={styles.menuItem}
                    href="/artists"
                  >Artists</Icon>
                  <Icon
                    button="primary"
                    block
                    type="music"
                    className={styles.menuItem}
                    href="/songs"
                  >Songs</Icon>
                  <Icon
                    button="primary"
                    block
                    type="list"
                    className={styles.menuItem}
                    href="/playLists"
                  >Play Lists</Icon>
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
                <Icon
                  button="primary"
                  block
                  type="cd"
                  className={styles.menuItem}
                  href="/albums"
                >Albums</Icon>
                <Icon
                  button="primary"
                  block
                  type="user"
                  className={styles.menuItem}
                  href="/artists"
                >Artists</Icon>
                <Icon
                  button="primary"
                  block
                  type="music"
                  className={styles.menuItem}
                  href="/songs"
                >Songs</Icon>
                <Icon
                  button="primary"
                  block
                  type="list"
                  className={styles.menuItem}
                  href="/playLists"
                >Play Lists</Icon>
                <Icon
                  button="primary"
                  block
                  type="play"
                  className={styles.menuItem}
                  href="/now"
                >Now Playing</Icon>
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
