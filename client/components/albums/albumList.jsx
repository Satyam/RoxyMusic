import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';

import Navbar from 'react-bootstrap/lib/Navbar';
import Button from 'react-bootstrap/lib/Button';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';

import initStore from '_utils/initStore';
import isPlainClick from '_utils/isPlainClick';
import Icon from '_components/misc/icon';
import SearchField from '_components/misc/searchField';
import { getAlbums, getMoreAlbums } from '_store/actions';
import styles from './albumList.css';
import AlbumListItem from './albumListItem';

export function AlbumListComponent({
  albumList,
  search,
  nextOffset,
  onSearchChangeHandler,
  onSearchClearHandler,
  onMoreAlbumsHandler,
 }) {
  return (
    <div className={styles.albumList}>
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>
            <Icon type="arrow-up" href="/" label="Albums" />
          </Navbar.Brand>
        </Navbar.Header>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Navbar.Form pullLeft>
            <SearchField
              search={search}
              onChangeHandler={onSearchChangeHandler}
              onClearHandler={onSearchClearHandler}
            />
          </Navbar.Form>
        </Navbar.Collapse>
      </Navbar>
      <ListGroup>
        {
          albumList.map(album => (
            album.error
            ? null
            : (<AlbumListItem
              key={album.idAlbum}
              idAlbum={album.idAlbum}
            />)
          ))
        }
        <ListGroupItem>
          <Button
            onClick={ev => isPlainClick(ev) && onMoreAlbumsHandler(search, nextOffset)}
            block
          ><Icon type="menu-down" label="More" /></Button>
        </ListGroupItem>
      </ListGroup>
    </div>
  );
}

AlbumListComponent.propTypes = {
  albumList: PropTypes.array,
  search: PropTypes.string,
  nextOffset: PropTypes.number,
  onSearchChangeHandler: PropTypes.func,
  onSearchClearHandler: PropTypes.func,
  onMoreAlbumsHandler: PropTypes.func,
};


export const storeInitializer = (dispatch, state) => {
  if (state.albums.nextOffset === 0) {
    return dispatch(getAlbums());
  }
  return undefined;
};

export const mapStateToProps = state => state.albums;

export const mapDispatchToProps = dispatch => ({
  onSearchChangeHandler: ev => dispatch(getAlbums(ev.target.value)),
  onSearchClearHandler: ev => isPlainClick(ev) && dispatch(getAlbums()),
  onMoreAlbumsHandler:
    (search, nextOffset) => dispatch(getMoreAlbums(search, nextOffset)),
});

export default compose(
  initStore(storeInitializer),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(AlbumListComponent);
