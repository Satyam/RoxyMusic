import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Button from 'react-bootstrap/lib/Button';
import Icon from '_components/misc/icon';
import compose from 'recompose/compose';
import FoldingToolbar from '_components/misc/foldingToolbar';
import isPlainClick from '_utils/isPlainClick';
import {
  playNow,
} from '_store/actions';
import styles from './nowPlayingTracksToolbar.css';

export const NowPlayingTracksToolbarComponent = ({ onPlayClick }) => (
  <div className={styles.right}>
    <FoldingToolbar>
      <Button onClick={onPlayClick} >
        <Icon type="play" />
      </Button>
    </FoldingToolbar>
  </div>
);

NowPlayingTracksToolbarComponent.propTypes = {
  // idTrack: PropTypes.number,
  onPlayClick: PropTypes.func,
};

export const mapStateToProps = (state, props) =>
  state.tracks[props.idTrack || props.params.idTrack] || {};

export const mapDispatchToProps = (dispatch, props) => ({
  onPlayClick: ev => isPlainClick(ev) && dispatch(playNow(props.idTrack)),
});

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
)(NowPlayingTracksToolbarComponent);
