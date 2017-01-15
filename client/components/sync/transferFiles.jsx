import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';

import Icon from '_components/misc/icon';
import Table from 'react-bootstrap/lib/Table';
import ProgressBar from 'react-bootstrap/lib/ProgressBar';

import initStore from '_utils/initStore';

import {
  push,
  getTransferPending,
  importOneTrack,
} from '_store/actions';


export function TransferFilesComponent({
  pending,
  i,
  onDone,
}) {
  const progress = Math.floor((i * 100) / pending.length);
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
          <th>Artist</th>
          <th>Album</th>
          <th>Title</th>
          <th>Done</th>
        </tr>
      </thead>
      <tbody>
        {pending.map(file => (
          <tr
            key={file.idTrack}
            className={[
              '',
              'bg-primary',
              'bg-info',
            ][file.status || 0]}
          >
            <td>{file.artist}</td>
            <td>{file.album}</td>
            <td>{file.title}</td>
            <td><Icon
              type={[
                'option-horizontal',
                'refresh',
                'ok',
              ][file.status || 0]}
            /></td>
          </tr>
        ))}
      </tbody>
    </Table>
    <Icon
      className="btn btn-default btn-block"
      type="ok"
      onClick={onDone}
      label="Done"
    />
  </div>);
}

TransferFilesComponent.propTypes = {
  pending: PropTypes.arrayOf(
    PropTypes.object
  ),
  i: PropTypes.number,
  onDone: PropTypes.func,
};

export const storeInitializer = (dispatch, state) =>
  state.sync.pending.length ||
  dispatch(getTransferPending())
  .then(() => dispatch(importOneTrack()));

export const mapStateToProps = state => state.sync;

export const mapDispatchToProps = dispatch => ({
  onDone: () => dispatch(push('/')),
});

export default compose(
  initStore(storeInitializer),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(TransferFilesComponent);
