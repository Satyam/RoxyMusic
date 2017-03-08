import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';

import Navbar from 'react-bootstrap/lib/Navbar';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';

import initStore from '_utils/initStore';
import Icon from '_components/misc/icon';
import SearchField from '_components/misc/searchField';
import { getArtists, getMoreArtists } from '_store/actions';
import { artistSelectors } from '_store/selectors';
import ArtistListItem from './artistListItem';

export function ArtistListComponent({
  list,
  search,
  onSearchChangeHandler,
  onSearchClearHandler,
  onMoreArtistsHandler,
 }) {
  return (
    <div>
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
          list.map(artist => (
            artist.error
            ? null
            : (<ArtistListItem
              key={artist.idArtist}
              idArtist={artist.idArtist}
            />)
          ))
        }
        <ListGroupItem>
          <Icon
            button
            block
            type="menu-down"
            label="More"
            onClick={onMoreArtistsHandler}
          />
        </ListGroupItem>
      </ListGroup>
    </div>
  );
}

ArtistListComponent.propTypes = {
  list: PropTypes.array,
  search: PropTypes.string,
  onSearchChangeHandler: PropTypes.func,
  onSearchClearHandler: PropTypes.func,
  onMoreArtistsHandler: PropTypes.func,
};


export const storeInitializer = (dispatch, getState) =>
  artistSelectors.isEmpty(getState()) && dispatch(getArtists());

export const mapStateToProps = state => ({
  list: artistSelectors.list(state),
  search: artistSelectors.searchTerm(state),
});

export const mapDispatchToProps = dispatch => ({
  onSearchChangeHandler: ev => dispatch(getArtists(ev.target.value)),
  onSearchClearHandler: () => dispatch(getArtists()),
  onMoreArtistsHandler: () => dispatch(getMoreArtists()),
});

export default compose(
  initStore(storeInitializer),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(ArtistListComponent);
