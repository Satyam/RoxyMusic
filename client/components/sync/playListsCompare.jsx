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

import initStore from '_utils/initStore';

import PlayListItemCompare from './playListItemCompare';

export function PlayListCompareComponent({
  hash,
  onDone,
}) {
  return (
    <ListGroup>
      {
        Object.keys(hash).map(idPlayList => (
          <PlayListItemCompare
            key={idPlayList}
            idPlayList={idPlayList}
          />
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
  Object.keys(state.sync.hash).length ||
    dispatch(getServerPlayLists())
    .then(() => dispatch(getClientPlayLists()));

export const mapStateToProps = state => state.sync;

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
