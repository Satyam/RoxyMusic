import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import isEmpty from 'lodash/isEmpty';
import { getAlbum } from '_store/actions';
import initStore from '_utils/initStore';
import TrackList from '_components/tracks/trackList';
import styles from './album.css';

export const AlbumComponent = ({ idAlbum, album, artists, numTracks, idTracks }) =>
  (idAlbum || null) && (
    <div className={styles.album}>
      <h1>{album}</h1>
      <div className={styles.albumInfo}>
        <div className={styles.albumArtist}>{artists}</div>
        <div className={styles.albumNumTracks}>{numTracks}</div>
      </div>
      <TrackList idTracks={idTracks} />
    </div>
  );


AlbumComponent.propTypes = {
  idAlbum: PropTypes.number,
  album: PropTypes.string,
  artists: PropTypes.string,
  numTracks: PropTypes.number,
  idTracks: PropTypes.arrayOf(
    PropTypes.number
  ),
};

export const storeInitializer = (dispatch, state, props) => {
  const idAlbum = props.params.idAlbum;
  if (!state.albums[idAlbum] || isEmpty(state.albums[idAlbum].tracks)) {
    return dispatch(getAlbum(idAlbum));
  }
  return undefined;
};

export const mapStateToProps = (state, props) => state.albums[props.params.idAlbum] || {};

const enhance = compose(
  connect(
    mapStateToProps
  ),
  initStore(storeInitializer)
);

export default enhance(AlbumComponent);
