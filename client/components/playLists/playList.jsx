import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Navbar from 'react-bootstrap/lib/Navbar';
import Icon from '_components/misc/icon';
import TrackList from '_components/tracks/trackList';
import compose from 'recompose/compose';
import {
  getPlayList,
  getPlayLists,
  updatePlayList,
} from '_store/actions';

import initStore from '_utils/initStore';
import styles from './playList.css';

export const PlayListComponent = ({ idPlayList, name, idTracks, onDragEnd }) =>
  (typeof idPlayList !== 'undefined' || null) && (
    <div className={styles.playList}>
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>
            <Icon type="arrow-up" href="/" label="  " />
            <Icon type="list" label={name} />
          </Navbar.Brand>
        </Navbar.Header>
        <div className={styles.playListnumTracks}>
          {idTracks.length} {idTracks.length === 1 ? 'track' : 'tracks'}
        </div>
      </Navbar>
      <TrackList
        idTracks={idTracks}
        onDragEnd={onDragEnd}
      />
    </div>
  );


PlayListComponent.propTypes = {
  idPlayList: PropTypes.string,
  name: PropTypes.string,
  idTracks: PropTypes.arrayOf(
    PropTypes.number
  ),
  error: PropTypes.number,
  onDragEnd: PropTypes.func,
};

export const storeInitializer = (dispatch, state, props) => {
  const idPlayList = props.params.idPlayList || 0;
  return (
    state.playLists.status > 0
    ? Promise.resolve()
    : dispatch(getPlayLists())
  ).then(() =>
    (state.playLists.hash[idPlayList] && state.playLists.hash[idPlayList].idTracks)
    || dispatch(getPlayList(idPlayList)));
};

export const mapStateToProps =
  (state, props) => state.playLists.hash[props.params.idPlayList || 0] || {};

export const mapDispatchToProps = (dispatch, props) => ({
  onDragEnd: idTracks =>
    dispatch(updatePlayList(props.params.idPlayList, props.params.name, idTracks)),
});

const enhance = compose(
  initStore(storeInitializer),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
);

export default enhance(PlayListComponent);
