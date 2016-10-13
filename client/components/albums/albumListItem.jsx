import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link, routerShape, withRouter } from 'react-router';
import styles from './albumListItem.css';

export const AlbumListItemComponent = ({ idAlbum, album, artists, numTracks, router }) => (
  <li className={styles.li}>
    <div className="row">
      <div className={styles.album}>
        <Link
          to={`/albums/${idAlbum}`}
          activeClassName={styles.disguiseLink}
          onClick={(ev) => {
            if (router.isActive(`/albums/${idAlbum}`, true)) {
              ev.preventDefault();
            }
          }}
        >
          {album}
        </Link>
      </div>
      <div className={styles.artists}>
        {artists}
      </div>
      <div className={styles.numTracks}>
        Tracks: {numTracks}
      </div>
    </div>
  </li>
);


AlbumListItemComponent.propTypes = {
  idAlbum: PropTypes.number.isRequired,
  album: PropTypes.string,
  artists: PropTypes.string,
  numTracks: PropTypes.number,
  router: routerShape,
};

export const mapStateToProps = (state, props) => state.albums[props.idAlbum] || {};

export default withRouter(connect(
  mapStateToProps
)(AlbumListItemComponent));
