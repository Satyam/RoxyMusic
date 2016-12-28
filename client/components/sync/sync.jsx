import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';

import Icon from '_components/misc/icon';
import Alert from 'react-bootstrap/lib/Alert';
import initStore from '_utils/initStore';
import { storeInitializer } from '_components/playLists/playLists';

import { startSync, getDifferences } from '_store/actions';


const messages = [
  '',
  'idDevice received',
  'Current server playlists received',
];

export function SyncComponent({
  stage,
  onSyncStart,
  uuid,
  idDevice,
  list,
}) {
  return (<div>
    <Icon
      type="retweet"
      className="btn btn-default"
      onClick={onSyncStart}
      label="Start"
      disabled={stage !== 0}
    />
    <Alert bsStyle="info">{messages[stage]}</Alert>
    <p>{`uuid: ${uuid}, idDevice: ${idDevice}`}</p>
    <ul>
      {list.map(item => (
        <li key={item.idPlayList}>
          {item.idPlayList}: ({item.idPlayListHistory}) <strong>{item.currentName}</strong>
          <ul>
            {item.currentIdTracks.split(',').map(idTrack => (<li key={idTrack}>{idTrack}</li>))}
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
  stage: PropTypes.number,
};

export const mapStateToProps = state => state.sync;

export const mapDispatchToProps = dispatch => ({
  onSyncStart: () =>
    dispatch(startSync())
    .then(action => dispatch(getDifferences(action.payload.idDevice))),
});


export default compose(
  initStore(storeInitializer),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(SyncComponent);
