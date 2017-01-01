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
            <Icon type="arrow-up" href="/" label="Artists" />
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
          ><Icon type="menu-down" label="More" /></Button>
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
