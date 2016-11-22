import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import FoldingToolbar from '_components/misc/foldingToolbar';
// import Icon from '_components/misc/icon';
// import Button from 'react-bootstrap/lib/Button';
import styles from './albumListItem.css';

export const AlbumListItemComponent = ({ idAlbum, album, artists }) => (
  <ListGroupItem className={styles.li}>
    <div className={styles.left}>
      <div className={styles.album}>
        <Link to={`/albums/${idAlbum}`}>
          {album}
        </Link>
      </div>
      <div className={styles.artists}>
        {artists}
      </div>
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
};

export const mapStateToProps = (state, props) => state.albums.albumHash[props.idAlbum] || {};

export default connect(
  mapStateToProps
)(AlbumListItemComponent);
