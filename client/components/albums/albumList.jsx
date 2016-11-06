import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { compose } from 'recompose';

import Navbar from 'react-bootstrap/lib/Navbar';
import Button from 'react-bootstrap/lib/Button';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';

import initStore from '_utils/initStore';
import isPlainClick from '_utils/isPlainClick';
import Icon from '_utils/icon';
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
            <Link href="/"><Icon type="arrow-up" /> Albums</Link>
          </Navbar.Brand>
        </Navbar.Header>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Navbar.Form pullLeft>
            <FormGroup className="input-group">
              <span className="input-group-addon"><Icon type="search" /></span>
              <FormControl
                type="text"
                value={search || ''}
                placeholder="Search"
                onChange={onSearchChangeHandler}
              />
              <button
                className="input-group-addon"
                style={{ color: (search ? 'black' : 'silver') }}
                onClick={onSearchClearHandler}
              >
                <Icon type="remove-circle" />
              </button>
            </FormGroup>
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
          ><Icon type="menu-down" /> More</Button>
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

const enhance = compose(
  initStore(storeInitializer),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
);

export default enhance(AlbumListComponent);
