import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import isPlainClick from '_utils/isPlainClick';
import { getTracks, playNow } from '_store/actions';
import initStore from '_utils/initStore';
import Icon from '_components/misc/icon';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import FoldingToolbar from '_components/misc/foldingToolbar';
import styles from './track.css';

export const TrackComponent = ({ idTrack, title, artist, track, error, onPlayClick }) =>
  (idTrack || null) && (
    error === 404
    ? (<div className={styles.notFound}>Track for that URL no longer exists</div>)
    : (
      <ListGroupItem className={styles.track}>
        <div className={styles.trackNum}>{track || '_'}</div>
        <div className={styles.left}>
          <div className={styles.title}>{title}</div>
          <div className={styles.artist}>{artist}</div>
        </div>
        <div className={styles.right}>
          <FoldingToolbar>
            <button onClick={onPlayClick} >
              <Icon type="play" />
            </button>
          </FoldingToolbar>
        </div>
      </ListGroupItem>
    )
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
  return state.tracks[idTrack] || dispatch(getTracks(idTrack));
};

export const mapStateToProps = (state, props) =>
  state.tracks[props.idTrack || props.params.idTrack] || {};

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
