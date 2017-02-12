import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Icon from '_components/misc/icon';
import compose from 'recompose/compose';
import withProps from 'recompose/withProps';
import FoldingToolbar from '_components/misc/foldingToolbar';

import {
  deleteTrackFromPlaylist,
} from '_store/actions';

export const PlayListTrackToolbarComponent = ({ onDeleteClick }) => (
  <FoldingToolbar>
    <Icon button type="trash" onClick={onDeleteClick} title="Play now" />
  </FoldingToolbar>
);

PlayListTrackToolbarComponent.propTypes = {
  onDeleteClick: PropTypes.func,
};

export const mapDispatchToProps = (dispatch, { idPlayList, idTrack }) => ({
  onDeleteClick: () => dispatch(deleteTrackFromPlaylist(idPlayList, idTrack)),
});

export default idPlayList => compose(
  withProps({
    idPlayList,
  }),
  connect(
    null,
    mapDispatchToProps
  ),
)(PlayListTrackToolbarComponent);
