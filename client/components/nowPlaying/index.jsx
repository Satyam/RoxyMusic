import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import initStore from '_utils/initStore';

import Navbar from 'react-bootstrap/lib/Navbar';
import Icon from '_components/misc/icon';
import TrackList, { storeInitializer as trackListInitializer } from '_components/tracks/draggableTrackList';

import {
  loadNowPlayingList,
  reorderNowPlayingTracks,
 } from '_store/actions';

import { nowPlayingSelectors } from '_store/selectors';

import Toolbar from './nowPlayingTracksToolbar';

export const NowPlayingComponent = ({ idTracks, on, currentIdTrack, router, onDragEnd }) =>
  (idTracks.length || null) && (
    <div>
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>
            { router && (<Icon type="arrow-up" href="/" label="  " />)}
            Now Playing {on ? '' : ' (none) '}
          </Navbar.Brand>
        </Navbar.Header>
      </Navbar>
      <TrackList
        idTracks={idTracks}
        Toolbar={Toolbar}
        background={{ [currentIdTrack]: 'info' }}
        onDragEnd={onDragEnd}
      />
    </div>
  );

NowPlayingComponent.propTypes = {
  idTracks: PropTypes.arrayOf(
    PropTypes.number
  ),
  on: PropTypes.bool,
  currentIdTrack: PropTypes.number,
  Toolbar: PropTypes.element,
  onDragEnd: PropTypes.func,
};

export const storeInitializer = (dispatch, getState) => dispatch(loadNowPlayingList())
.then(() =>
  trackListInitializer(dispatch, getState, { idTracks: nowPlayingSelectors.idTracks(getState()) })
);


export const mapStateToProps = state => ({
  on: nowPlayingSelectors.on(state),
  idTracks: nowPlayingSelectors.idTracks(state),
  currentIdTrack: nowPlayingSelectors.currentIdTrack(state),
});

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
