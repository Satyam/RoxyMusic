import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import initStore from '_utils/initStore';

import TrackList from '_components/tracks/trackList';

import { loadPlayingList } from '_store/actions';

export const NowPlayingComponent = ({ idTracks }) =>
  (idTracks || null) && (
    <TrackList idTracks={idTracks} />
  );

NowPlayingComponent.propTypes = {
  idTracks: PropTypes.arrayOf(
    PropTypes.number
  ),
};
export const storeInitializer = (dispatch, state) => (
  state.nowPlaying.loaded || dispatch(loadPlayingList())
);

export const mapStateToProps = state => state.nowPlaying || {};

export default compose(
  initStore(storeInitializer),
  connect(
    mapStateToProps
  )
)(NowPlayingComponent);
