import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { compose } from 'recompose';
import sortBy from 'lodash/sortBy';

import Navbar from 'react-bootstrap/lib/Navbar';
import ListGroup from 'react-bootstrap/lib/ListGroup';

import initStore from '_utils/initStore';
import Icon from '_utils/icon';
import { getPlayLists } from '_store/actions';
import styles from './playLists.css';
import PlayListItem from './playListItem';

export function PlayListsComponent({
  playLists,
 }) {
  return (
    <div className={styles.playLists}>
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>
            <Link href="/"><Icon type="arrow-up" /> Play Lists</Link>
          </Navbar.Brand>
        </Navbar.Header>
        <Navbar.Toggle />
      </Navbar>
      <ListGroup>
        {
          sortBy(playLists, playList => playList.name).map(playList => (
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
  playLists: PropTypes.object,
};


export const storeInitializer = (dispatch, state) =>
  state.playLists.length || dispatch(getPlayLists());

export const mapStateToProps = state => state;


const enhance = compose(
  initStore(storeInitializer),
  connect(
    mapStateToProps
  )
);

export default enhance(PlayListsComponent);
