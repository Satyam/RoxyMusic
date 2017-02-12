import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';

import Navbar from 'react-bootstrap/lib/Navbar';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';

import initStore from '_utils/initStore';
import Icon from '_components/misc/icon';
import SearchField from '_components/misc/searchField';
import { getAlbums, getMoreAlbums } from '_store/actions';
import { albumSelectors } from '_store/selectors';

import AlbumListItem from './albumListItem';

export function AlbumListComponent({
  list,
  search,
  onSearchChangeHandler,
  onSearchClearHandler,
  onMoreAlbumsHandler,
 }) {
  return (
    <div>
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>
            <Icon type="arrow-up" href="/" label="Albums" />
          </Navbar.Brand>
        </Navbar.Header>
        <Navbar.Form pullLeft>
          <SearchField
            search={search}
            onChangeHandler={onSearchChangeHandler}
            onClearHandler={onSearchClearHandler}
          />
        </Navbar.Form>
      </Navbar>
      <ListGroup>
        {
          list.map(album => (
            album.error
            ? null
            : (<AlbumListItem
              key={album.idAlbum}
              idAlbum={album.idAlbum}
            />)
          ))
        }
        <ListGroupItem>
          <Icon
            button
            block
            type="menu-down"
            label="More"
            onClick={onMoreAlbumsHandler}
          />
        </ListGroupItem>
      </ListGroup>
    </div>
  );
}

AlbumListComponent.propTypes = {
  list: PropTypes.array,
  search: PropTypes.string,
  onSearchChangeHandler: PropTypes.func,
  onSearchClearHandler: PropTypes.func,
  onMoreAlbumsHandler: PropTypes.func,
};


export const storeInitializer = (dispatch, state) => {
  if (albumSelectors.isEmpty(state)) {
    return dispatch(getAlbums());
  }
  return undefined;
};

export const mapStateToProps = state => ({
  list: albumSelectors.list(state),
  search: albumSelectors.searchTerm(state),
});

export const mapDispatchToProps = dispatch => ({
  onSearchChangeHandler: ev => dispatch(getAlbums(ev.target.value)),
  onSearchClearHandler: () => dispatch(getAlbums()),
  onMoreAlbumsHandler: () => dispatch(getMoreAlbums()),
});

export default compose(
  initStore(storeInitializer),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(AlbumListComponent);
