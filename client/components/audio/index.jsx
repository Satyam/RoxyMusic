import React, { PropTypes } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import initStore from '_utils/initStore';
import plainJoin from '_utils/plainJoin';

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
  autoPlay: PropTypes.bool,
  onEnded: PropTypes.func,
};

export function storeInitializer(dispatch, state) {
  let trackP = false;
  if (state.nowPlaying.status === 2) {
    const nowPlaying = state.nowPlaying;
    const current = nowPlaying.current;
    if (current !== -1) {
      const idTrack = nowPlaying.idTracks[current];
      trackP = state.tracks[idTrack] || dispatch(getTrack(idTrack));
    }
  }
  return trackP;
}

export function mapStateToProps(state) {
  if (state.nowPlaying.status === 2) {
    const nowPlaying = state.nowPlaying;
    const current = nowPlaying.current;
    if (current !== -1) {
      const idTrack = nowPlaying.idTracks[current];
      if (state.tracks[idTrack] && state.config.musicDir) {
        return {
          idTrack,
          src: plainJoin(
              BUNDLE === 'webClient'
              ? '/music'
              : state.config.musicDir
            ,
            state.tracks[idTrack].location
          ),
          autoPlay: true,
        };
      }
    }
  }
  return {
    src: '',
    autoPlay: false,
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
  ),
)(AudioComponent);
