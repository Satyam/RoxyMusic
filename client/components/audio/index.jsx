import React, { PropTypes } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import initStore from '_utils/initStore';
import path from 'path';

import {
  playNextTrack,
  getTrack,
} from '_store/actions';

export function AudioComponent({ src, autoPlay, onEnded }) {
  return (
    <ReactAudioPlayer src={src} autoPlay={autoPlay} onEnded={onEnded} />
  );
}

AudioComponent.propTypes = {
  // idTrack: PropTypes.number,
  src: PropTypes.string,
  autoPlay: PropTypes.string,
  onEnded: PropTypes.func,
};

export function storeInitializer(dispatch, state) {
  if (state.nowPlaying.loaded) {
    const nowPlaying = state.nowPlaying;
    const current = nowPlaying.current;
    if (current !== -1) {
      const idTrack = nowPlaying.idTracks[current];
      return state.tracks[idTrack] || dispatch(getTrack(idTrack));
    }
  }
  return null;
}

export function mapStateToProps(state) {
  if (state.nowPlaying.loaded) {
    const nowPlaying = state.nowPlaying;
    const current = nowPlaying.current;
    if (current !== -1) {
      const idTrack = nowPlaying.idTracks[current];
      if (state.tracks[idTrack]) {
        return {
          idTrack,
          src: path.join('/music', state.tracks[idTrack].location),
          autoPlay: 'true',
        };
      }
    }
  }
  return {
    src: '',
    autoPlay: 'false',
  };
}

export const mapDispatchToProps = dispatch => ({
  onEnded: () => dispatch(playNextTrack()),
});

export default compose(
  initStore(storeInitializer),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(AudioComponent);