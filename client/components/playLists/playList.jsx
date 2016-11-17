import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Navbar from 'react-bootstrap/lib/Navbar';
import Icon from '_components/misc/icon';
import TrackList from '_components/tracks/trackList';
import compose from 'recompose/compose';
import { getPlayList, getPlayLists } from '_store/actions';
import initStore from '_utils/initStore';
import styles from './playList.css';

export const PlayListComponent = ({ idPlayList, name, numTracks, idTracks }) =>
  (idPlayList || null) && (
    <div className={styles.playList}>
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>
            <Icon type="arrow-up" href="/">{name}</Icon>
          </Navbar.Brand>
        </Navbar.Header>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <div className={styles.playListnumTracks}>
            {numTracks} {numTracks === 1 ? 'track' : 'tracks'}
          </div>
        </Navbar.Collapse>
      </Navbar>
      <TrackList idTracks={idTracks} />
    </div>
  );


PlayListComponent.propTypes = {
  idPlayList: PropTypes.number,
  name: PropTypes.string,
  numTracks: PropTypes.number,
  idTracks: PropTypes.arrayOf(
    PropTypes.number
  ),
  error: PropTypes.number,
};

export const storeInitializer = (dispatch, state, props) => {
  const idPlayList = props.params.idPlayList || 0;
  return (
    state.playLists.length
    ? Promise.resolve()
    : dispatch(getPlayLists())
  ).then(() =>
    (state.playLists[idPlayList] && state.playLists[idPlayList].idTracks)
    || dispatch(getPlayList(idPlayList)));
};

export const mapStateToProps =
  (state, props) => state.playLists[props.params.idPlayList || 0] || {};

const enhance = compose(
  initStore(storeInitializer),
  connect(
    mapStateToProps
  )
);

export default enhance(PlayListComponent);
