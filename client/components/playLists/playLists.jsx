import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import sortBy from 'lodash/sortBy';

import Navbar from 'react-bootstrap/lib/Navbar';
import ListGroup from 'react-bootstrap/lib/ListGroup';

import initStore from '_utils/initStore';
import Icon from '_components/misc/icon';
import { getPlayLists } from '_store/actions';
import styles from './playLists.css';
import PlayListItem from './playListItem';

export function PlayListsComponent({
  hash,
 }) {
  return (
    <div className={styles.playLists}>
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>
            <Icon type="arrow-up" href="/" label="Play Lists" />
          </Navbar.Brand>
        </Navbar.Header>
        <Navbar.Toggle />
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
};


export const storeInitializer = (dispatch, state) =>
  state.playLists.loaded || dispatch(getPlayLists());

export const mapStateToProps = state => state.playLists;


const enhance = compose(
  initStore(storeInitializer),
  connect(
    mapStateToProps
  )
);

export default enhance(PlayListsComponent);
