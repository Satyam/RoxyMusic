import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Navbar from 'react-bootstrap/lib/Navbar';
import Icon from '_components/misc/icon';
import compose from 'recompose/compose';
import { getAlbum } from '_store/actions';
import initStore from '_utils/initStore';
import TrackList from '_components/tracks/trackList';
import styles from './album.css';

export const AlbumComponent = ({ idAlbum, album, artists, numTracks, idTracks, error }) =>
  (idAlbum || null) && (
    error === 404
    ? (<div className={styles.notFound}>Album for that URL no longer exists</div>)
    : (
      <div className={styles.album}>
        <Navbar>
          <Navbar.Header>
            <Navbar.Brand>
              <Link href="/"><Icon type="arrow-up" /> {album}</Link>
            </Navbar.Brand>
          </Navbar.Header>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <div className={styles.albumInfo}>
              <div className={styles.albumArtist}>{artists}</div>
              <div className={styles.albumNumTracks}>
                {numTracks} {numTracks === 1 ? 'track' : 'tracks'}
              </div>
            </div>
          </Navbar.Collapse>
        </Navbar>
        <TrackList idTracks={idTracks} />
      </div>
    )
  );


AlbumComponent.propTypes = {
  idAlbum: PropTypes.number,
  album: PropTypes.string,
  artists: PropTypes.string,
  numTracks: PropTypes.number,
  idTracks: PropTypes.arrayOf(
    PropTypes.number
  ),
  error: PropTypes.number,
};

export const storeInitializer = (dispatch, state, props) => {
  const idAlbum = props.params.idAlbum;
  return state.albums.albumHash[idAlbum] || dispatch(getAlbum(idAlbum));
};

export const mapStateToProps = (state, props) => state.albums.albumHash[props.params.idAlbum] || {};

export default compose(
  initStore(storeInitializer),
  connect(
    mapStateToProps
  )
)(AlbumComponent);
