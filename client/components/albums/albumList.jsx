import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import isEmpty from 'lodash/isEmpty';
import initialDispatcher from '_utils/initialDispatcher';
import { getAlbums } from '_store/actions';
import styles from './albumList.css';
import AlbumListItem from './albumListItem';

export function AlbumListComponent({ children, albums }) {
  return (
    <div className={styles.projectList}>
      <h1>Albums:</h1>
      <ul>{
        albums.map(album => (
          album.error
          ? null
          : (<AlbumListItem
            key={album.idAlbum}
            idAlbum={album.idAlbum}
          />)
        ))
      }</ul>
      {children}
    </div>
  );
}

AlbumListComponent.propTypes = {
  children: PropTypes.node,
  albums: PropTypes.array,
};


export const initialDispatch = (dispatch, state) => {
  if (isEmpty(state.albums)) {
    return dispatch(getAlbums());
  }
  return undefined;
};

export const mapStateToProps = state => ({
  albums: state.albums,
});

export default initialDispatcher(initialDispatch)(connect(
  mapStateToProps
)(AlbumListComponent));
