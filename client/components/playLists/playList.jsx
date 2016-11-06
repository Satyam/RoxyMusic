import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Navbar from 'react-bootstrap/lib/Navbar';
import Icon from '_utils/icon';
import compose from 'recompose/compose';
import { getPlayList } from '_store/actions';
import initStore from '_utils/initStore';
import styles from './playList.css';

export const PlayListComponent = ({ idPlayList, album, artists, numTracks }) =>
  (idPlayList || null) && (
    <div className={styles.album}>
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>
            <Link href="/"><Icon type="arrow-up" /> {album}</Link>
          </Navbar.Brand>
        </Navbar.Header>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <div className={styles.albumInfo}>
            <div className={styles.albumArtist}>{artists}</div>
            <div className={styles.albumNumTracks}>
              {numTracks} {numTracks === 1 ? 'track' : 'tracks'}
            </div>
          </div>
        </Navbar.Collapse>
      </Navbar>
    </div>
  );


PlayListComponent.propTypes = {
  idPlayList: PropTypes.number,
  album: PropTypes.string,
  artists: PropTypes.string,
  numTracks: PropTypes.number,
  idTracks: PropTypes.arrayOf(
    PropTypes.number
  ),
  error: PropTypes.number,
};

export const storeInitializer = (dispatch, state, props) => {
  const idPlayList = props.params.idPlayList;
  return state.playLists[idPlayList] || dispatch(getPlayList(idPlayList));
};

export const mapStateToProps = (state, props) => state.playLists[props.params.idPlayList] || {};

const enhance = compose(
  initStore(storeInitializer),
  connect(
    mapStateToProps
  )
);

export default enhance(PlayListComponent);
