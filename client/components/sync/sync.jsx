import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';

import Icon from '_components/misc/icon';
import { startSync, getDifferences } from '_store/actions';

export function SyncComponent({ onSyncStart, uuid, idDevice, list }) {
  return (<div>
    <Icon
      type="retweet"
      className="btn btn-default"
      onClick={onSyncStart}
      label="Start"
    />
    <p>{`uuid: ${uuid}, idDevice: ${idDevice}`}</p>
    <ul>
      {list.map(item => (
        <li>{item.idPlayList}: ({item.idPlayListHistory}) <em>{item.currentName}</em>
          <ul>
            {item.currentIdTracks.split(',').map(idTrack => (<li>{idTrack}</li>))}
          </ul>
        </li>
      ))}
    </ul>
  </div>);
}

SyncComponent.propTypes = {
  onSyncStart: PropTypes.func,
  uuid: PropTypes.string,
  idDevice: PropTypes.number,
  list: PropTypes.array,
};

export const mapStateToProps = state => state.sync;

export const mapDispatchToProps = dispatch => ({
  onSyncStart: () =>
    dispatch(startSync())
    .then(action => dispatch(getDifferences(action.payload.idDevice))),
});

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(SyncComponent);
