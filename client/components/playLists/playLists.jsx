import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';


import Navbar from 'react-bootstrap/lib/Navbar';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import Icon from '_components/misc/icon';
import FoldingToolbar from '_components/misc/foldingToolbar';

import isPlainClick from '_utils/isPlainClick';
import initStore from '_utils/initStore';
import { getPlayLists, saveAllPlayLists } from '_store/actions';

import { playListSelectors } from '_store/selectors';

import styles from './playLists.css';
import PlayListItem from './playListItem';

export function PlayListsComponent({
  list,
  onPlayListSave,
 }) {
  return (
    <div className={styles.playLists}>
      <Navbar fluid>
        <Navbar.Header>
          <Navbar.Brand>
            <Icon type="arrow-up" href="/" label="Play Lists" />
          </Navbar.Brand>
        </Navbar.Header>
        <FoldingToolbar>
          <Icon button type="save" onClick={onPlayListSave} title="Save all playlists" />
        </FoldingToolbar>
      </Navbar>
      <ListGroup>
        {
          list.map(playList => (
            <PlayListItem
              key={playList.idPlayList}
              idPlayList={playList.idPlayList}
            />
          ))
        }
      </ListGroup>
    </div>
  );
}

PlayListsComponent.propTypes = {
  list: PropTypes.arrayOf(PropTypes.object),
  onPlayListSave: PropTypes.func,
};


export const storeInitializer = (dispatch, state) =>
  playListSelectors.loading(state) || dispatch(getPlayLists());

export const mapStateToProps = state => ({
  list: playListSelectors.orderedList(state),
});

export const mapDispatchToProps = dispatch => ({
  onPlayListSave: ev => isPlainClick(ev) && dispatch(saveAllPlayLists()),
});

const enhance = compose(
  initStore(storeInitializer),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
);

export default enhance(PlayListsComponent);
