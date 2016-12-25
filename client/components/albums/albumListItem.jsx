import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import FoldingToolbar from '_components/misc/foldingToolbar';
import { Album, Artist } from '_components/entries';
// import Button from 'react-bootstrap/lib/Button';
import styles from './albumListItem.css';

export const AlbumListItemComponent = ({ idAlbum, album, artists, idArtist }) => (
  <ListGroupItem className={styles.li}>
    <div className={styles.left}>
      <Album
        className={styles.album}
        idAlbum={idAlbum}
        album={album}
      />
      <Artist
        className={styles.artists}
        idArtist={idArtist}
        artist={artists}
      />
    </div>
    <FoldingToolbar>
      {/*
      <Button onClick={console.log.bind(console, 'play')}><Icon type="play" /></Button>
      <Button onClick={console.log.bind(console, 'up')}><Icon type="arrow-up" /></Button>
      <Button onClick={console.log.bind(console, 'otro')}>otro</Button>
      */}
    </FoldingToolbar>
  </ListGroupItem>
);


AlbumListItemComponent.propTypes = {
  idAlbum: PropTypes.number.isRequired,
  album: PropTypes.string,
  artists: PropTypes.string,
  idArtist: PropTypes.number,
};

export const mapStateToProps = (state, props) => state.albums.albumHash[props.idAlbum] || {};

export default connect(
  mapStateToProps
)(AlbumListItemComponent);
