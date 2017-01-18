import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import initStore from '_utils/initStore';
import plainJoin from '_utils/plainJoin';
import Icon from '_components/misc/icon';
import ProgressBar from 'react-bootstrap/lib/ProgressBar';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Button from 'react-bootstrap/lib/Button';
import Well from 'react-bootstrap/lib/Well';
import bindHandlers from '_utils/bindHandlers';
import isPlainClick from '_utils/isPlainClick';

import {
  playNextTrack,
  getTrack,
} from '_store/actions';

import styles from './index.css';

export function secsToHHMMSS(secs) {
  const hh = Math.floor(secs / 3600);
  function pad(n) {
    return `00${Math.floor(n)}`.substr(-2);
  }
  return (
    hh
    ? `${hh}:${pad((secs - (hh * 3600)) / 60)}:${pad(secs % 60)}`
    : `${Math.floor(secs / 60)}:${pad(secs % 60)}`
  );
}
export class AudioComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      idTrack: props.idTrack,
      src: props.src,
      playing: false,
      currentTime: 0,
    };
    bindHandlers(this);
  }
  componentDidMount() {
    const audio = this.audio;
    audio.onplaying = this.onPlayHandler;
    audio.ontimeupdate = this.onTimeUpdateHandler;
    audio.onpause = this.onPauseHandler;
    audio.onended = this.onEndedHandler;
  }
  onPlayPauseClickHandler(ev) {
    if (isPlainClick(ev)) {
      const audio = this.audio;
      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
      }
    }
  }
  onPlayHandler() {
    this.setState({
      playing: true,
      duration: this.audio.duration,
    });
  }
  onTimeUpdateHandler() {
    this.setState({ currentTime: this.audio.currentTime });
  }
  onPauseHandler() {
    this.setState({ playing: false });
  }
  onEndedHandler() {
    this.setState({ playing: false });
    this.props.onEnded();
  }
  onRewindHandler() {
    this.audio.currentTime = 0;
  }
  render() {
    const state = this.state;
    return (<Well className={styles.audio} >
      <audio
        ref={(el) => { this.audio = el; }}
        src={this.props.src}
        autoPlay
      />
      <Icon
        type="step-backward"
        title="Rewind"
        onClick={this.onRewindHandler}
        className={styles.left}
      />
      <Icon
        type={(
          state.playing
          ? 'pause'
          : 'play'
        )}
        title={(
          state.playing
          ? 'Pause'
          : 'Play'
        )}
        onClick={this.onPlayPauseClickHandler}
        className={styles.left}
      />
      <ProgressBar
        now={state.currentTime}
        max={state.duration}
        label={secsToHHMMSS(state.currentTime)}
        className={styles.bar}
      />
      <Icon
        type="step-forward"
        title="Rewind"
        onClick={this.onEndedHandler}
        className={styles.right}
      />
  </Well>);
  }
}

AudioComponent.propTypes = {
  // idTrack: PropTypes.number,
  idTrack: PropTypes.number,
  src: PropTypes.string,
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
