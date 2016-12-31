import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import map from 'lodash/map';

import Icon from '_components/misc/icon';
import Alert from 'react-bootstrap/lib/Alert';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import initStore from '_utils/initStore';
import { storeInitializer } from '_components/playLists/playLists';

import {
  startSync,
  getHistory,
  importPlayList,
  updateHistory,
  createHistory,
  addPlayList,
} from '_store/actions';


const messages = [
  '',
  'idDevice received',
  'Current server playlists received',
];

export function SyncComponent({
  stage,
  uuid,
  idDevice,
  hash,
  onSyncStart,
  onListImport,
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
    {
      stage > 0
      ? (<p>{`uuid: ${uuid}, idDevice: ${idDevice}`}</p>)
      : null
    }
    {
      stage === 2
      ? (
        <ListGroup>
          {map(hash, (playList, idPlayList) => {
            if (playList.currentName && !playList.oldName && !playList.name) {
              return (
                <ListGroupItem
                  key={idPlayList}
                  header={playList.currentName}
                  bsStyle="success"
                >
                  Playlist in server is new
                  <Icon
                    className="btn btn-default"
                    type="import"
                    onClick={onListImport(idPlayList, idDevice, playList.idPlayListHistory)}
                    title="Import from server"
                    label="Import"
                  />
                </ListGroupItem>
              );
            }
            return (
              <ListGroupItem
                key={idPlayList}
                header={playList.name}
                bsStyle="warning"
              >
                {JSON.stringify(playList)}
              </ListGroupItem>
            );
          })}
        </ListGroup>
     )
     : null
    }
  </div>);
}

SyncComponent.propTypes = {
  uuid: PropTypes.string,
  idDevice: PropTypes.number,
  stage: PropTypes.number,
  hash: PropTypes.object,
  onSyncStart: PropTypes.func,
  onListImport: PropTypes.func,
};

export const mapStateToProps = state => state.sync;

export const mapDispatchToProps = dispatch => ({
  onSyncStart: () =>
    dispatch(startSync())
    .then(action => dispatch(getHistory(action.payload.idDevice))),
  onListImport: (idPlayList, idDevice, idPlayListHistory) => () =>
    dispatch(importPlayList(idPlayList))
    .then((action) => {
      const { name, idTracks } = action.payload;
      return dispatch(addPlayList(name, idTracks, idPlayList))
      .then(() => dispatch(
          idPlayListHistory
          ? updateHistory(idPlayListHistory, name, idTracks)
          : createHistory(idDevice, idPlayList, name, idTracks)
        ));
    }),
});


export default compose(
  initStore(storeInitializer),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(SyncComponent);
