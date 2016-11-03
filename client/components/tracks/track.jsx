import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { compose, withHandlers } from 'recompose';
import isPlainClick from '_utils/isPlainClick';
import { getTrack, playNow } from '_store/actions';
import initStore from '_utils/initStore';
import Icon from '_utils/icon';
import styles from './track.css';

export const TrackComponent = ({ idTrack, title, artist, track, onPlayClick }) =>
  (idTrack || null) && (
    <li className={styles.track}>
      <div className={styles.trackNum}>{track}</div>
      <div className={styles.title}>{title}</div>
      <button className={styles.playButton} onClick={onPlayClick} >
        <Icon type="play" />
      </button>
      <div className={styles.artist}>{artist}</div>
    </li>
  );

TrackComponent.propTypes = {
  idTrack: PropTypes.number,
  title: PropTypes.string,
  artist: PropTypes.string,
  track: PropTypes.number,
  onPlayClick: PropTypes.func,
};

const handlers = withHandlers({
  onPlayClick: props => ev => isPlainClick(ev) && props.onPlay(props.idTrack),
});

export const storeInitializer = (dispatch, state, props) => {
  const idTrack = props.idTrack || props.params.idTrack;
  if (!state.tracks[idTrack]) {
    return dispatch(getTrack(idTrack));
  }
  return undefined;
};

export const mapStateToProps = (state, props) =>
  state.tracks[props.idTrack || props.params.idTrack] || {};

export const mapDispatchToProps = dispatch => ({
  onPlay: idTrack => dispatch(playNow(idTrack)),
});

export default compose(
  initStore(storeInitializer),
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  handlers
)(TrackComponent);
