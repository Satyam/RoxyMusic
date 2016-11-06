import ReactAudioPlayer from 'react-audio-player';
import { connect } from 'react-redux';
import path from 'path';

import {
  playNextTrack,
} from '_store/nowPlaying/actions';

export const mapStateToProps = state => ({
  src: (
    state.nowPlaying.nowPlaying === -1
    ? ''
    : path.join('/music', state.tracks[state.nowPlaying.playNowList[state.nowPlaying.nowPlaying]].location)
  ),
  autoPlay: (state.nowPlaying.nowPlaying !== -1 ? 'true' : 'false'),
});

export const mapDispatchToProps = dispatch => ({
  onEnded: () => dispatch(playNextTrack()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ReactAudioPlayer);
