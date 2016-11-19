import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Icon from '_components/misc/icon';
import Button from 'react-bootstrap/lib/Button';
import compose from 'recompose/compose';
import FoldingToolbar from '_components/misc/foldingToolbar';
import isPlainClick from '_utils/isPlainClick';
import {
  playNow,
  addToNowPlaying,
  replaceNowPlaying,
  addTrackToPlaylist,
} from '_store/actions';
import styles from './defaultTracksToolbar.css';

export const TracksToolbarComponent = ({
  onPlayNowClick,
  onAddToPlayNowClick,
  onReplacePlayNowClick,
  onAddToPlayList,
}) => (
  <div className={styles.right}>
    <FoldingToolbar>
      <Button onClick={onPlayNowClick} >
        <Icon type="play" label="!" title="play now" />
      </Button>
      <Button onClick={onAddToPlayNowClick} >
        <Icon type="play,plus" title="Play later" />
      </Button>
      <Button onClick={onReplacePlayNowClick} >
        <Icon type="remove-sign,play" title="Clear list and play this" />
      </Button>
      <Button onClick={onAddToPlayList} >
        <Icon type="indent-left" title="add to PlayList" />
      </Button>
    </FoldingToolbar>
  </div>
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
  onReplacePlayNowClick: ev => isPlainClick(ev) && dispatch(replaceNowPlaying(props.idTrack)),
  onAddToPlayList: ev => isPlainClick(ev) && dispatch(addTrackToPlaylist(props.idTrack)),
});

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
)(TracksToolbarComponent);
