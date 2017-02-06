import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';

import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import Icon from '_components/misc/icon';

import initStore from '_utils/initStore';
import { storeInitializer } from '_components/playLists/playLists';

import {
  startSync,
  push,
} from '_store/actions';

import { configSelectors } from '_store/selectors';

import styles from './index.css';

export function SyncComponent({
  remoteHost,
  onSyncStart,
}) {
  let icon;
  let msg;
  const Types = window.Connection;
  switch (navigator.connection.type) {
    case Types.NONE:
      icon = 'remove-sign';
      msg = 'none';
      break;
    case Types.WIFI:
    case Types.ETHERNET:
      icon = 'transfer';
      msg = 'local';
      break;
    case Types.UNKNOWN:
      icon = 'question-sign';
      msg = 'uknown';
      break;
    default:
      icon = 'flash';
      msg = '3G';
  }
  return (
    <ListGroup>
      <ListGroupItem>
        <div className={styles.heading}>1 of 5: Connection</div>
      </ListGroupItem>
      <ListGroupItem className={styles.status}>
        <Icon
          type={icon}
          label={msg}
        />
        <p><strong>Host</strong>: {remoteHost}</p>
      </ListGroupItem>
      <ListGroupItem>
        <Icon
          type="retweet"
          button
          block
          onClick={onSyncStart}
          label="Start"
        />
      </ListGroupItem>
    </ListGroup>
  );
}

SyncComponent.propTypes = {
  remoteHost: PropTypes.string,
  onSyncStart: PropTypes.func,
};

export const mapStateToProps = state =>
  ({ remoteHost: configSelectors.get(state, 'remoteHost') });

export const mapDispatchToProps = dispatch => ({
  onSyncStart: () =>
    dispatch(startSync())
    .then(() => dispatch(push('/sync/PlayListsCompare'))),
});


export default compose(
  initStore(storeInitializer),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(SyncComponent);
