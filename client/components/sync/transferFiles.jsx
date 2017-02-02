import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';

import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import Icon from '_components/misc/icon';
import Table from 'react-bootstrap/lib/Table';
import ProgressBar from 'react-bootstrap/lib/ProgressBar';

import initStore from '_utils/initStore';

import {
  push,
  startMp3Transfer,
} from '_store/actions';

import styles from './index.css';

export function TransferFilesComponent({
  mp3TransferPending,
  i,
  onDone,
}) {
  const progress = Math.floor((i * 100) / mp3TransferPending.length);
  return (<div>
    <ListGroup>
      <ListGroupItem>
        <div className={styles.heading}>
          Importing music files
        </div>
      </ListGroupItem>
      <ListGroupItem>
        <ProgressBar
          now={progress}
          label={`${i} of ${mp3TransferPending.length}`}
          striped
          bsStyle="info"
        />
      </ListGroupItem>
      <ListGroupItem>
        <Table bordered condensed hover responsive>
          <thead>
            <tr>
              <th />
              <th>Artist</th>
              <th>Album</th>
              <th>Title</th>
            </tr>
          </thead>
          <tbody>
            {mp3TransferPending.map(file => (
              <tr
                key={file.idTrack}
                className={[
                  '',
                  'bg-primary',
                  'bg-info',
                ][file.status || 0]}
              >
                <td><Icon
                  type={[
                    'option-horizontal',
                    'refresh',
                    'ok',
                  ][file.status || 0]}
                /></td>
                <td>{file.artist}</td>
                <td>{file.album}</td>
                <td>{file.title}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </ListGroupItem>
      <ListGroupItem>
        <Icon
          button
          block
          type="ok"
          onClick={onDone}
          label="Done"
          disabled={i !== mp3TransferPending.length}
        />
      </ListGroupItem>
    </ListGroup>
  </div>);
}

TransferFilesComponent.propTypes = {
  mp3TransferPending: PropTypes.arrayOf(
    PropTypes.object
  ),
  i: PropTypes.number,
  onDone: PropTypes.func,
};

export const storeInitializer = dispatch =>
  dispatch(startMp3Transfer());


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
