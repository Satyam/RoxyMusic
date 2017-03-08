import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Navbar from 'react-bootstrap/lib/Navbar';
import Icon from '_components/misc/icon';
import compose from 'recompose/compose';
import { getAlbum } from '_store/actions';
import { albumSelectors } from '_store/selectors';
import initStore from '_utils/initStore';
import TrackList from '_components/tracks/trackList';
import styles from './styles.css';

export const AlbumComponent = ({ idAlbum, album, artists, numTracks, idTracks, error }) =>
  (idAlbum || null) && (
    error === 404
    ? (<div className={styles.notFound}>Album for that URL no longer exists</div>)
    : (
      <div className={styles.album}>
        <Navbar>
          <Navbar.Header>
            <Navbar.Brand>
              <Icon type="arrow-up" href="/" label=" " />
              <Icon type="cd" label={album} />
            </Navbar.Brand>
          </Navbar.Header>
          <div className={styles.albumInfo}>
            <div className={styles.albumArtist}><Icon type="user" label={artists} /></div>
            <div className={styles.albumNumTracks}>
              {numTracks} {numTracks === 1 ? 'track' : 'tracks'}
            </div>
          </div>
        </Navbar>
        <TrackList
          idTracks={idTracks}
          Toolbar="default"
          sorted
        />
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

export const storeInitializer = (dispatch, getState, props) => {
  const idAlbum = parseInt(props.params.idAlbum, 10);
  return albumSelectors.exists(getState(), idAlbum) || dispatch(getAlbum(idAlbum));
};

export const mapStateToProps = (state, props) =>
  albumSelectors.item(state, props.params.idAlbum);

export default compose(
  initStore(storeInitializer),
  connect(
    mapStateToProps
  )
)(AlbumComponent);
