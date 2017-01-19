import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Icon from '_components/misc/icon';
import compose from 'recompose/compose';
import FoldingToolbar from '_components/misc/foldingToolbar';
import isPlainClick from '_utils/isPlainClick';
import {
  playNow,
  addToNowPlaying,
  replaceNowPlaying,
  addTracksToPlayList,
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
  // idTrack: PropTypes.number,
  onPlayNowClick: PropTypes.func,
  onAddToPlayNowClick: PropTypes.func,
  onReplacePlayNowClick: PropTypes.func,
  onAddToPlayList: PropTypes.func,
};

export const mapStateToProps = (state, props) =>
  state.tracks[props.idTrack || props.params.idTrack] || {};

export const mapDispatchToProps = (dispatch, props) => ({
  onPlayNowClick: ev => isPlainClick(ev) && dispatch(playNow(props.idTrack)),
  onAddToPlayNowClick: ev => isPlainClick(ev) && dispatch(addToNowPlaying(props.idTrack)),
  onReplacePlayNowClick: ev => isPlainClick(ev) && dispatch(replaceNowPlaying([props.idTrack])),
  onAddToPlayList: ev => isPlainClick(ev) && dispatch(addTracksToPlayList(props.idTrack)),
});

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
)(TracksToolbarComponent);
