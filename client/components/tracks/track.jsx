import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { compose, withHandlers } from 'recompose';
import isPlainClick from '_utils/isPlainClick';
import { getTrack, playNow } from '_store/actions';
import initialDispatcher from '_utils/initialDispatcher';
import styles from './track.css';

export const TrackComponent = ({ idTrack, title, artist, track, onPlayClick }) =>
  (idTrack || null) && (
    <div className={styles.track}>
      <h1>{idTrack}</h1>
      <p>Title {title}</p>
      <button className="glyphicon glyphicon-play" onClick={onPlayClick} />
      <p>Artists {artist}</p>
      <p>Tracks {track}</p>
    </div>
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

export const initialDispatch = (dispatch, state, props) => {
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
  initialDispatcher(initialDispatch),
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  handlers
)(TrackComponent);
