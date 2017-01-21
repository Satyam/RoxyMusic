import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';

import Navbar from 'react-bootstrap/lib/Navbar';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';

import TrackList from '_components/tracks/trackList';

import initStore from '_utils/initStore';
import isPlainClick from '_utils/isPlainClick';
import Icon from '_components/misc/icon';
import SearchField from '_components/misc/searchField';
import { getSongs, getMoreSongs } from '_store/actions';
import styles from './songList.css';

export function SongListComponent({
  list,
  search,
  nextOffset,
  onSearchChangeHandler,
  onSearchClearHandler,
  onMoreSongsHandler,
 }) {
  return (
    <div className={styles.songList}>
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>
            <Icon type="arrow-up" href="/" label="Songs" />
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
      <TrackList
        idTracks={list.map(song => song.idTrack)}
        Toolbar="default"
      >
        <ListGroupItem>
          <Icon
            button
            block
            type="menu-down"
            label="More"
            onClick={ev => isPlainClick(ev) && onMoreSongsHandler(search, nextOffset)}
          />
        </ListGroupItem>
      </TrackList>
    </div>
  );
}

SongListComponent.propTypes = {
  list: PropTypes.array,
  search: PropTypes.string,
  nextOffset: PropTypes.number,
  onSearchChangeHandler: PropTypes.func,
  onSearchClearHandler: PropTypes.func,
  onMoreSongsHandler: PropTypes.func,
};


export const storeInitializer =
  (dispatch, state) => (state.songs.nextOffset || dispatch(getSongs()));

export const mapStateToProps = state => state.songs;

export const mapDispatchToProps = dispatch => ({
  onSearchChangeHandler: ev => dispatch(getSongs(ev.target.value)),
  onSearchClearHandler: ev => isPlainClick(ev) && dispatch(getSongs()),
  onMoreSongsHandler:
    (search, nextOffset) => dispatch(getMoreSongs(search, nextOffset)),
});

export default compose(
  initStore(storeInitializer),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(SongListComponent);
