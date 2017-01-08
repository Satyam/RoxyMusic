import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';

import Icon from '_components/misc/icon';

import initStore from '_utils/initStore';
import { storeInitializer } from '_components/playLists/playLists';

import {
  startSync,
} from '_store/actions';


export function SyncComponent({
  onSyncStart,
}) {
  return (<div>
    <Icon
      type="retweet"
      className="btn btn-default btn-block"
      onClick={onSyncStart}
      label="Start"
    />
  </div>);
}

SyncComponent.propTypes = {
  onSyncStart: PropTypes.func,
};

export const mapStateToProps = state => state.sync;

export const mapDispatchToProps = dispatch => ({
  onSyncStart: () =>
    dispatch(startSync()),
});


export default compose(
  initStore(storeInitializer),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(SyncComponent);
