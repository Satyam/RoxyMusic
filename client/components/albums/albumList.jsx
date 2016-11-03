import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { compose, withHandlers } from 'recompose';

import Navbar from 'react-bootstrap/lib/Navbar';
import Button from 'react-bootstrap/lib/Button';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';

import size from 'lodash/size';

import initStore from '_utils/initStore';
import Icon from '_utils/icon';
import { getAlbums } from '_store/actions';
import styles from './albumList.css';
import AlbumListItem from './albumListItem';

export function AlbumListComponent({ albums, onChangeHandler }) {
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
              <FormControl type="text" placeholder="Search" onChange={onChangeHandler} />
              <span className="input-group-addon" style={{ color: 'silver' }}><Icon type="remove-circle" /></span>
            </FormGroup>
          </Navbar.Form>
        </Navbar.Collapse>
      </Navbar>
      <ListGroup>
        <ListGroupItem><Button block><Icon type="menu-up" /> More</Button></ListGroupItem>
        {
          albums.map(album => (
            album.error
            ? null
            : (<AlbumListItem
              key={album.idAlbum}
              idAlbum={album.idAlbum}
            />)
          ))
        }
        <ListGroupItem><Button block><Icon type="menu-down" /> More</Button></ListGroupItem>
      </ListGroup>
    </div>
  );
}

AlbumListComponent.propTypes = {
  albums: PropTypes.array,
  onChangeHandler: PropTypes.func,
};


export const storeInitializer = (dispatch, state) => {
  if (size(state.albums) < 20) {
    return dispatch(getAlbums());
  }
  return undefined;
};

export const mapStateToProps = state => ({
  albums: state.albums,
});

const handlers = withHandlers({
  onChangeHandler: props => ev => console.log(ev.target.value),
});

const enhance = compose(
  connect(
    mapStateToProps
  ),
  initStore(storeInitializer),
  handlers
);

export default enhance(AlbumListComponent);
