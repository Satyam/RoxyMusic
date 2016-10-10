import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import styles from './album.css';

export const AlbumComponent = ({ idAlbum, album }) => (
  <div className={styles.album}>
    <h1>{idAlbum}</h1>
    <p>{album}</p>
  </div>
);


AlbumComponent.propTypes = {
  idAlbum: PropTypes.string.isRequired,
  album: PropTypes.string,
};

export const mapStateToProps = (state, props) => state.albums[props.idAlbum] || {};

export default connect(
  mapStateToProps
)(AlbumComponent);
