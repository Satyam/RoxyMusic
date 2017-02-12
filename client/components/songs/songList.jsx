import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';

import Navbar from 'react-bootstrap/lib/Navbar';

import TrackList from '_components/tracks/trackList';

import initStore from '_utils/initStore';
import isPlainClick from '_utils/isPlainClick';
import Icon from '_components/misc/icon';
import SearchField from '_components/misc/searchField';

import { getSongs, getMoreSongs } from '_store/actions';
import { songSelectors } from '_store/selectors';

import styles from './songList.css';

export function SongListComponent({
  list,
  search,
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
        onMoreClick={onMoreSongsHandler}
      />
    </div>
  );
}

SongListComponent.propTypes = {
  list: PropTypes.array,
  search: PropTypes.string,
  onSearchChangeHandler: PropTypes.func,
  onSearchClearHandler: PropTypes.func,
  onMoreSongsHandler: PropTypes.func,
};


export const storeInitializer =
  (dispatch, state) => !songSelectors.isEmpty(state) || dispatch(getSongs());

export const mapStateToProps = state => ({
  list: songSelectors.list(state),
  search: songSelectors.searchTerm(state),
});

export const mapDispatchToProps = dispatch => ({
  onSearchChangeHandler: ev => dispatch(getSongs(ev.target.value)),
  onSearchClearHandler: ev => isPlainClick(ev) && dispatch(getSongs()),
  onMoreSongsHandler: ev => isPlainClick(ev) && dispatch(getMoreSongs()),
});

export default compose(
  initStore(storeInitializer),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(SongListComponent);
