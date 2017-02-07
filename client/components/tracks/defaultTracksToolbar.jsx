import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Icon from '_components/misc/icon';
import compose from 'recompose/compose';
import FoldingToolbar from '_components/misc/foldingToolbar';

import {
  playNow,
  addToNowPlaying,
  replaceNowPlaying,
  selectPlayListToAddTracksTo,
} from '_store/actions';

export const TracksToolbarComponent = ({
  onPlayNowClick,
  onAddToPlayNowClick,
  onReplacePlayNowClick,
  onAddToPlayList,
}) => (
  <FoldingToolbar>
    <Icon button type="play" label="!" onClick={onPlayNowClick} title="play now" />
    <Icon button type="play,plus" onClick={onAddToPlayNowClick} title="Play later" />
    <Icon
      button
      type="remove-sign,play"
      onClick={onReplacePlayNowClick}
      title="Clear list and play this"
    />
    <Icon button type="indent-left" onClick={onAddToPlayList} title="add to PlayList" />
  </FoldingToolbar>
);

TracksToolbarComponent.propTypes = {
  onPlayNowClick: PropTypes.func,
  onAddToPlayNowClick: PropTypes.func,
  onReplacePlayNowClick: PropTypes.func,
  onAddToPlayList: PropTypes.func,
};

export const mapDispatchToProps = (dispatch, { idTrack }) => ({
  onPlayNowClick: () => dispatch(playNow(idTrack)),
  onAddToPlayNowClick: () => dispatch(addToNowPlaying(idTrack)),
  onReplacePlayNowClick: () => dispatch(replaceNowPlaying([idTrack])),
  onAddToPlayList: () => dispatch(selectPlayListToAddTracksTo(idTrack)),
});

export default compose(
  connect(
    null,
    mapDispatchToProps
  ),
)(TracksToolbarComponent);
