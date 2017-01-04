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
  getMissingTracks,
  getConfig,
} from '_store/actions';

import styles from './sync.css';

export function SyncComponent({
  idDevice,
  hash,
  stage,
  onSyncStart,
  onListImport,
  onDone,
}) {
  const hasHash = !!Object.keys(hash).length;
  return (<div>
    <ListGroup>
      <ListGroupItem>
        <Icon
          type="retweet"
          className="btn btn-default btn-block"
          onClick={onSyncStart}
          label="Start"
          disabled={stage > 0}
        />
      </ListGroupItem>
      {
        (stage >= 2 || null)
        && (
            (hasHash || null)
            && map(hash, (playList, idPlayList) => {
              if (playList.serverName && !playList.previousName && !playList.name) {
                return (
                  <ListGroupItem
                    className={styles.listGroupItem}
                    key={idPlayList}
                    bsStyle="success"
                  >
                    <div className={styles.info}>
                      <div className={styles.name}>{playList.serverName}</div>
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
            })
          )
      }
      {
        (stage >= 2 || null)
        && (<ListGroupItem>
          <Icon
            className="btn btn-default btn-block"
            type="ok"
            onClick={onDone}
            label="Done"
            disabled={stage >= 12}
          />
        </ListGroupItem>
      )
    }
    </ListGroup>
  </div>);
}

SyncComponent.propTypes = {
  idDevice: PropTypes.number,
  hash: PropTypes.object,
  stage: PropTypes.number,
  onSyncStart: PropTypes.func,
  onListImport: PropTypes.func,
  onDone: PropTypes.func,
};

export const mapStateToProps = state => state.sync;

export const mapDispatchToProps = dispatch => ({
  onSyncStart: () =>
    dispatch(getConfig('remoteHost'))
    .then(remoteHost => dispatch(startSync(remoteHost)))
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
  onDone: () => dispatch(getMissingTracks()),
});


export default compose(
  initStore(storeInitializer),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(SyncComponent);
