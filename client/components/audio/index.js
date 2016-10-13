import ReactAudioPlayer from 'react-audio-player';
import { connect } from 'react-redux';
import path from 'path';

import {
  playNextTrack,
} from '_store/playing/actions';

export const mapStateToProps = state => ({
  src: (
    state.playing.nowPlaying === -1
    ? ''
    : path.join('/music', state.tracks[state.playing.playNowList[state.playing.nowPlaying]].location)
  ),
  autoPlay: (state.playing.nowPlaying !== -1 ? 'true' : 'false'),
});

export const mapDispatchToProps = dispatch => ({
  onEnded: () => dispatch(playNextTrack()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ReactAudioPlayer);
