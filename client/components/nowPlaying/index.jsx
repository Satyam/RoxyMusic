import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import initStore from '_utils/initStore';

import Navbar from 'react-bootstrap/lib/Navbar';
import Icon from '_components/misc/icon';
import TrackList from '_components/tracks/trackList';

import {
  loadPlayingList,
  reorderNowPlayingTracks,
 } from '_store/actions';

import Toolbar from './nowPlayingTracksToolbar';

export const NowPlayingComponent = ({ idTracks, current, router, onDragEnd }) =>
  (idTracks.length || null) && (
    <div>
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>
            { router && (<Icon type="arrow-up" href="/" label="  " />)}
            Now Playing {current === -1 ? ' (none) ' : ''}
          </Navbar.Brand>
        </Navbar.Header>
      </Navbar>
      <TrackList
        idTracks={idTracks}
        Toolbar={Toolbar}
        background={{ [idTracks[current]]: 'info' }}
        onDragEnd={onDragEnd}
      />
    </div>
  );

NowPlayingComponent.propTypes = {
  idTracks: PropTypes.arrayOf(
    PropTypes.number
  ),
  Toolbar: PropTypes.element,
  onDragEnd: PropTypes.func,
};

export const storeInitializer = (dispatch, state) => (
  state.nowPlaying.status > 0 || dispatch(loadPlayingList())
);

export const mapStateToProps = state => state.nowPlaying || {};

export const mapDispatchToProps = dispatch => ({
  onDragEnd: idTracks => dispatch(reorderNowPlayingTracks(idTracks)),
});

export default compose(
  initStore(storeInitializer),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(NowPlayingComponent);
