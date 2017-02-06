import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';

import Icon from '_components/misc/icon';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';

import {
  push,
  getServerPlayLists,
  getClientPlayLists,
} from '_store/actions';

import {
  syncSelectors,
} from '_store/selectors';

import initStore from '_utils/initStore';

import PlayListItemCompare from './playListItemCompare';

import styles from './index.css';

export function PlayListCompareComponent({
  hash,
  onDone,
}) {
  return (
    <ListGroup>
      <ListGroupItem>
        <div className={styles.heading}>
          2 of 5: Comparing Playlists
        </div>
      </ListGroupItem>
      {
        Object.keys(hash).map(idPlayList => (
          <ListGroupItem key={idPlayList}>
            <PlayListItemCompare idPlayList={idPlayList} />
          </ListGroupItem>
        ))
      }
      <ListGroupItem>
        <Icon
          button
          block
          type="ok"
          onClick={onDone}
          label="Done"
        />
      </ListGroupItem>
    </ListGroup>
  );
}

PlayListCompareComponent.propTypes = {
  hash: PropTypes.object,
  onDone: PropTypes.func,
};

export const storeInitializer = (dispatch, state) =>
  !syncSelectors.isEmpty(state) ||
    dispatch(getServerPlayLists())
    .then(() => dispatch(getClientPlayLists()));

export const mapStateToProps = state => ({
  hash: syncSelectors.sideBySideHash(state),
});

export const mapDispatchToProps = dispatch => ({
  onDone: () => dispatch(push('/sync/TransferPlayLists')),
});

export default compose(
  initStore(storeInitializer),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(PlayListCompareComponent);
