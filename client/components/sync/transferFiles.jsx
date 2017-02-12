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
  startMp3Transfer,
} from '_store/actions';

import {
  syncSelectors,
} from '_store/selectors';

import styles from './styles.css';

export function TransferFilesComponent({
  list,
  index,
}) {
  const progress = Math.floor((index * 100) / list.length);
  return (<div>
    <ListGroup>
      <ListGroupItem>
        <div className={styles.heading}>
          5 of 5: Importing music files
        </div>
      </ListGroupItem>
      <ListGroupItem>
        <ProgressBar
          now={progress}
          label={`${index} of ${list.length}`}
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
            {list.map(file => (
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
    </ListGroup>
  </div>);
}

TransferFilesComponent.propTypes = {
  list: PropTypes.arrayOf(
    PropTypes.object
  ),
  index: PropTypes.number,
};

export const storeInitializer = dispatch =>
  dispatch(startMp3Transfer());


export const mapStateToProps = state => syncSelectors.mp3TransferPending(state);

export default compose(
  initStore(storeInitializer),
  connect(
    mapStateToProps
  )
)(TransferFilesComponent);
