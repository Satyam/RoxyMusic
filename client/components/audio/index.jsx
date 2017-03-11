import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import initStore from '_utils/initStore';
import plainJoin from '_utils/plainJoin';
import Icon from '_components/misc/icon';
import ProgressBar from 'react-bootstrap/lib/ProgressBar';
import Well from 'react-bootstrap/lib/Well';
import bindHandlers from '_utils/bindHandlers';

import {
  playNextTrack,
  getTrack,
  loadNowPlayingList,
} from '_store/actions';

import {
  nowPlayingSelectors,
  trackSelectors,
  configSelectors,
} from '_store/selectors';

import styles from './styles.css';

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
    const pgEl = ReactDOM.findDOMNode(this.pgBar);
    this.pgLeft = pgEl.offsetLeft;
    this.pgWidth = pgEl.offsetWidth;
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.src && this.props.src) {
      this.setState({
        currentTime: 0,
      });
    }
  }
  onPlayPauseClickHandler() {
    const audio = this.audio;
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
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
    this.setState({
      playing: false,
      currentTime: 0,
    });
    this.props.onEnded();
  }
  onRewindHandler() {
    this.audio.currentTime = 0;
  }
  onProgressBarClickHandler(ev) {
    this.audio.currentTime = ((ev.clientX - this.pgLeft) / this.pgWidth) * this.state.duration;
  }
  render() {
    const state = this.state;
    const disabled = !this.props.src;
    return (<Well className={styles.audio} >
      <audio
        ref={(el) => { this.audio = el; }}
        src={this.props.src}
        autoPlay
      />
      <Icon
        type="step-backward"
        button
        title="Rewind"
        onClick={this.onRewindHandler}
        className={styles.left}
        disabled={disabled}
      />
      <Icon
        button
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
        disabled={disabled}
      />
      <ProgressBar
        ref={(el) => { this.pgBar = el; }}
        now={state.currentTime}
        max={state.duration}
        label={secsToHHMMSS(state.currentTime)}
        className={styles.bar}
        onClick={this.onProgressBarClickHandler}
      />
      <Icon
        button
        type="step-forward"
        title="Rewind"
        onClick={this.onEndedHandler}
        className={styles.right}
        disabled={!this.props.hasNext}
      />
    </Well>);
  }
}

AudioComponent.propTypes = {
  // idTrack: PropTypes.number,
  hasNext: PropTypes.bool,
  src: PropTypes.string,
  onEnded: PropTypes.func,
};

export function storeInitializer(dispatch, getState) {
  return dispatch(loadNowPlayingList()).then(() => {
    const state = getState();
    if (nowPlayingSelectors.on(state)) {
      const idTrack = nowPlayingSelectors.currentIdTrack(state);
      if (idTrack) {
        return trackSelectors.exists(state, idTrack) || dispatch(getTrack(idTrack));
      }
    }
    return null;
  });
}

export function mapStateToProps(state) {
  if (nowPlayingSelectors.on(state)) {
    const idTrack = nowPlayingSelectors.currentIdTrack(state);
    if (trackSelectors.exists(state, idTrack) && configSelectors.get(state, 'musicDir')) {
      return {
        hasNext: nowPlayingSelectors.hasNext(state),
        src: plainJoin(
            BUNDLE === 'webClient'
            ? '/music'
            : configSelectors.get(state, 'musicDir')
          ,
          trackSelectors.item(state, idTrack).location
        ),
      };
    }
  }
  return {
    src: '',
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
