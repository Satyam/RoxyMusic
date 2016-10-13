import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import { getAlbum } from '_store/actions';
import initialDispatcher from '_utils/initialDispatcher';
import TrackList from '_components/tracks/trackList';
import styles from './album.css';

export const AlbumComponent = ({ idAlbum, album, artist, numTracks, idTracks }) =>
  (idAlbum || null) && (
    <div className={styles.album}>
      <h1>{idAlbum}</h1>
      <p>Album {album}</p>
      <p>Artist {artist}</p>
      <p>Number of tracks {numTracks}</p>
      <TrackList idTracks={idTracks} />
    </div>
  )
;


AlbumComponent.propTypes = {
  idAlbum: PropTypes.number,
  album: PropTypes.string,
  artist: PropTypes.string,
  numTracks: PropTypes.number,
  idTracks: PropTypes.arrayOf(
    PropTypes.number
  ),
};

export const initialDispatch = (dispatch, state, props) => {
  const idAlbum = props.params.idAlbum;
  if (!state.albums[idAlbum] || isEmpty(state.albums[idAlbum].tracks)) {
    return dispatch(getAlbum(idAlbum));
  }
  return undefined;
};

export const mapStateToProps = (state, props) => state.albums[props.params.idAlbum] || {};

export default initialDispatcher(initialDispatch)(connect(
  mapStateToProps
)(AlbumComponent));
