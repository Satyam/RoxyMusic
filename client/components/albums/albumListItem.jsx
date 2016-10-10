import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link, routerShape, withRouter } from 'react-router';
import styles from './albumListItem.css';

export const AlbumListItemComponent = ({ idAlbum, album, router }) => (
  <li className={styles.li}>
    <span className="glyphicon glyphicon-cd" />
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
  </li>
);


AlbumListItemComponent.propTypes = {
  idAlbum: PropTypes.number.isRequired,
  album: PropTypes.string,
  router: routerShape,
};

export const mapStateToProps = (state, props) => state.albums[props.idAlbum] || {};

export default withRouter(connect(
  mapStateToProps
)(AlbumListItemComponent));
