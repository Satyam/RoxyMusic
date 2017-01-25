import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Icon from '_components/misc/icon';
import compose from 'recompose/compose';
import FoldingToolbar from '_components/misc/foldingToolbar';
import isPlainClick from '_utils/isPlainClick';
import {
  playNow,
} from '_store/actions';

export const NowPlayingTracksToolbarComponent = ({ onPlayClick }) => (
  <FoldingToolbar>
    <Icon button type="play" onClick={onPlayClick} title="Play now" />
  </FoldingToolbar>
);

NowPlayingTracksToolbarComponent.propTypes = {
  // idTrack: PropTypes.number,
  onPlayClick: PropTypes.func,
};

export const mapStateToProps = (state, props) =>
  state.tracks[props.idTrack || props.params.idTrack] || {};

export const mapDispatchToProps = (dispatch, { idTrack }) => ({
  onPlayClick: ev => isPlainClick(ev) && dispatch(playNow(idTrack)),
});

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
)(NowPlayingTracksToolbarComponent);
