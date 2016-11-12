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
import Icon from '_components/misc/icon';
import { getArtists, getMoreArtists } from '_store/actions';
import styles from './artistList.css';
import ArtistListItem from './artistListItem';

export function ArtistListComponent({
  artistList,
  search,
  nextOffset,
  onSearchChangeHandler,
  onSearchClearHandler,
  onMoreArtistsHandler,
 }) {
  return (
    <div className={styles.artistList}>
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>
            <Link href="/"><Icon type="arrow-up" /> Artists</Link>
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
          artistList.map(artist => (
            artist.error
            ? null
            : (<ArtistListItem
              key={artist.idArtist}
              idArtist={artist.idArtist}
            />)
          ))
        }
        <ListGroupItem>
          <Button
            onClick={ev => isPlainClick(ev) && onMoreArtistsHandler(search, nextOffset)}
            block
          ><Icon type="menu-down" /> More</Button>
        </ListGroupItem>
      </ListGroup>
    </div>
  );
}

ArtistListComponent.propTypes = {
  artistList: PropTypes.array,
  search: PropTypes.string,
  nextOffset: PropTypes.number,
  onSearchChangeHandler: PropTypes.func,
  onSearchClearHandler: PropTypes.func,
  onMoreArtistsHandler: PropTypes.func,
};


export const storeInitializer = (dispatch, state) => {
  if (state.artists.nextOffset === 0) {
    return dispatch(getArtists());
  }
  return undefined;
};

export const mapStateToProps = state => state.artists;

export const mapDispatchToProps = dispatch => ({
  onSearchChangeHandler: ev => dispatch(getArtists(ev.target.value)),
  onSearchClearHandler: ev => isPlainClick(ev) && dispatch(getArtists()),
  onMoreArtistsHandler:
    (search, nextOffset) => dispatch(getMoreArtists(search, nextOffset)),
});

export default compose(
  initStore(storeInitializer),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(ArtistListComponent);
