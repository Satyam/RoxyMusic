import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Icon from '_components/misc/icon';
import compose from 'recompose/compose';
import FoldingToolbar from '_components/misc/foldingToolbar';

import {
  playNow,
} from '_store/actions';

export const NowPlayingTracksToolbarComponent = ({ onPlayClick }) => (
  <FoldingToolbar>
    <Icon button type="play" onClick={onPlayClick} title="Play now" />
  </FoldingToolbar>
);

NowPlayingTracksToolbarComponent.propTypes = {
  onPlayClick: PropTypes.func,
};

export const mapDispatchToProps = (dispatch, { idTrack }) => ({
  onPlayClick: () => dispatch(playNow(idTrack)),
});

export default compose(
  connect(
    null,
    mapDispatchToProps
  ),
)(NowPlayingTracksToolbarComponent);
