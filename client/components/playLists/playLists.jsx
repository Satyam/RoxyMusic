import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import sortBy from 'lodash/sortBy';

import Navbar from 'react-bootstrap/lib/Navbar';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import Button from 'react-bootstrap/lib/Button';
import Icon from '_components/misc/icon';
import FoldingToolbar from '_components/misc/foldingToolbar';

import isPlainClick from '_utils/isPlainClick';
import initStore from '_utils/initStore';
import { getPlayLists, saveAllPlayLists } from '_store/actions';
import styles from './playLists.css';
import PlayListItem from './playListItem';

export function PlayListsComponent({
  hash,
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
          <Button onClick={onPlayListSave} title="Save all playlists">
            <Icon type="save" />
          </Button>
        </FoldingToolbar>
      </Navbar>
      <ListGroup>
        {
          sortBy(hash, playList => playList.name).map(playList => (
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
  hash: PropTypes.objectOf(PropTypes.object),
  onPlayListSave: PropTypes.func,
};


export const storeInitializer = (dispatch, state) =>
  state.playLists.status > 0 || dispatch(getPlayLists());

export const mapStateToProps = state => state.playLists;

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
