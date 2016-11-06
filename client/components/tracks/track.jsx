import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import isPlainClick from '_utils/isPlainClick';
import { getTrack, playNow } from '_store/actions';
import initStore from '_utils/initStore';
import Icon from '_utils/icon';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import styles from './track.css';

export const TrackComponent = ({ idTrack, title, artist, track, onPlayClick }) =>
  (idTrack || null) && (
    <ListGroupItem className={styles.track}>
      <div className={styles.trackNum}>{track}</div>
      <div className={styles.left}>
        <div className={styles.title}>{title}</div>
        <div className={styles.artist}>{artist}</div>
      </div>
      <div className={styles.right}>
        <button className={styles.playButton} onClick={onPlayClick} >
          <Icon type="play" />
        </button>
      </div>
    </ListGroupItem>
  );

TrackComponent.propTypes = {
  idTrack: PropTypes.number,
  title: PropTypes.string,
  artist: PropTypes.string,
  track: PropTypes.number,
  onPlayClick: PropTypes.func,
};

export const storeInitializer = (dispatch, state, props) => {
  const idTrack = props.idTrack || props.params.idTrack;
  return state.tracks.trackHash[idTrack] || dispatch(getTrack(idTrack));
};

export const mapStateToProps = (state, props) =>
  state.tracks.trackHash[props.idTrack || props.params.idTrack] || {};

export const mapDispatchToProps = (dispatch, props) => ({
  onPlayClick: ev => isPlainClick(ev) && dispatch(playNow(props.idTrack)),
});

export default compose(
  initStore(storeInitializer),
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
)(TrackComponent);
