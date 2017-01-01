import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import map from 'lodash/map';

import Icon from '_components/misc/icon';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import FoldingToolbar from '_components/misc/foldingToolbar';

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

import styles from './sync.css';

export function SyncComponent({
  idDevice,
  hash,
  onSyncStart,
  onListImport,
}) {
  const hasHash = !!Object.keys(hash).length;
  return (<div>
    <Icon
      type="retweet"
      className="btn btn-default"
      onClick={onSyncStart}
      label="Start"
      disabled={hasHash}
    />
    {
      hasHash
      ? (
        <ListGroup>
          {map(hash, (playList, idPlayList) => {
            if (playList.currentName && !playList.oldName && !playList.name) {
              return (
                <ListGroupItem
                  className={styles.listGroupItem}
                  key={idPlayList}
                  bsStyle="success"
                >
                  <div className={styles.info}>
                    <div className={styles.name}>{playList.currentName}</div>
                    <div className={styles.status}>Playlist in server is new</div>
                  </div>
                  <FoldingToolbar>
                    <Icon
                      className="btn btn-default"
                      type="import"
                      onClick={onListImport(idPlayList, idDevice, playList.idPlayListHistory)}
                      title="Import from server"
                      label="Import"
                    />
                  </FoldingToolbar>
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
          <ListGroupItem>
            <Icon
              className="btn btn-default btn-block"
              type="ok"
              href="/"
              label="Done"
            />
          </ListGroupItem>
        </ListGroup>
     )
     : null
    }
  </div>);
}

SyncComponent.propTypes = {
  idDevice: PropTypes.number,
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
