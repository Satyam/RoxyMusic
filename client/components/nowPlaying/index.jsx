import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import initStore from '_utils/initStore';

import TrackList from '_components/tracks/trackList';

import { getPlayList, getPlayLists } from '_store/actions';

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
    state.playLists.length
    ? Promise.resolve()
    : dispatch(getPlayLists())
  ).then(() => (state.playLists[0] && state.playLists[0].idTracks) || dispatch(getPlayList('0')));

export const mapStateToProps = state => state.playLists[0] || {};

const enhance = compose(
  initStore(storeInitializer),
  connect(
    mapStateToProps
  )
);

export default enhance(NowPlayingComponent);
