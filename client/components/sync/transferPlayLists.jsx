import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';

import map from 'lodash/map';
import filter from 'lodash/filter';

import Icon from '_components/misc/icon';
import Table from 'react-bootstrap/lib/Table';
import ProgressBar from 'react-bootstrap/lib/ProgressBar';

import initStore from '_utils/initStore';

import {
  push,
  startPlayListTransfer,
  getMissingTracks,
} from '_store/actions';


export function TransferPlayListsComponent({
  hash,
  onDone,
}) {
  const total = filter(hash, playList => playList.action).length;
  const pending = filter(hash, playList => playList.action && playList.done).length;
  const progress = Math.floor((pending * 100) / total);
  return (<div>
    <ProgressBar
      now={progress}
      label={`${progress}%`}
      striped
      bsStyle="info"
    />
    <Table bordered condensed hover responsive>
      <thead>
        <tr>
          <th />
          <th>Playlist</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {map(hash, (playList, idPlayList) => (
          playList.action
          ? (
            <tr
              key={idPlayList}
              className={playList.done ? 'bg-info' : ''}
            >
              <td><Icon
                type={playList.done ? 'ok' : 'refresh'}
              /></td>
              <td>{playList.client.name || playList.server.name}</td>
              <td>{
                [
                  '',
                  'Send to server',
                  'Import from server',
                  'Delete on tablet',
                  'Delete on server',
                ][playList.action]
              }</td>
            </tr>
          )
          : null
        ))}
      </tbody>
    </Table>
    <Icon
      button
      block
      type="ok"
      onClick={onDone}
      label="Done"
      disabled={pending !== total}
    />
  </div>);
}

TransferPlayListsComponent.propTypes = {
  hash: PropTypes.shape({
    server: PropTypes.shape({
      name: PropTypes.string,
      idTracks: PropTypes.arrayOf(PropTypes.number),
      idDevice: PropTypes.number,
      lastUpdated: PropTypes.string,
    }),
    client: PropTypes.shape({
      name: PropTypes.string,
      idTracks: PropTypes.arrayOf(PropTypes.number),
      idDevice: PropTypes.number,
      lastUpdated: PropTypes.string,
    }),
    action: PropTypes.number,
    done: PropTypes.bool,
  }),
  onDone: PropTypes.func,
};

export const storeInitializer = dispatch => dispatch(startPlayListTransfer());

export const mapStateToProps = state => state.sync;

export const mapDispatchToProps = dispatch => ({
  onDone: () => dispatch(getMissingTracks())
    .then(() => dispatch(push('/sync/3'))),
});

export default compose(
  initStore(storeInitializer),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(TransferPlayListsComponent);
