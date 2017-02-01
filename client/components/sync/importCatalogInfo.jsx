import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';

import Icon from '_components/misc/icon';
import Table from 'react-bootstrap/lib/Table';
import ProgressBar from 'react-bootstrap/lib/ProgressBar';

import initStore from '_utils/initStore';

import {
  push,
  getMissingTracks,
} from '_store/actions';


export function ImportCatalogComponent({
  catalogImportStage,
  onDone,
}) {
  const total = 9;
  return (<div>
    <ProgressBar
      now={catalogImportStage}
      label={`${catalogImportStage} of ${total}`}
      striped
      bsStyle="info"
    />
    <Table bordered condensed hover responsive>
      <thead>
        <tr>
          <th />
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {[
          'Finding missing tracks for new playlists',
          'Importing missing tracks info from server',
          'Saving new tracks info into local catalog',
          'Finding missing albums for imported tracks',
          'Importing missing albums info from server',
          'Saving new album info into local catalog',
          'Finding missing artists for imported tracks',
          'Importing missing artists info from server',
          'Saving new artists info into local catalog',
        ].map((descr, index) => (
          <tr
            key={index}
            className={index < catalogImportStage ? 'bg-info' : ''}
          >
            <td><Icon
              type={index < catalogImportStage ? 'ok' : 'refresh'}
            /></td>
            <td>{descr}</td>
          </tr>
        ))}
      </tbody>
    </Table>
    <Icon
      button
      block
      type="ok"
      onClick={onDone}
      label="Done"
      disabled={catalogImportStage < total}
    />
  </div>);
}

ImportCatalogComponent.propTypes = {
  catalogImportStage: PropTypes.number,
  onDone: PropTypes.func,
};

export const storeInitializer = dispatch => dispatch(getMissingTracks());

export const mapStateToProps = state => state.sync;

export const mapDispatchToProps = dispatch => ({
  onDone: () => dispatch(push('/sync/TransferFiles')),
});

export default compose(
  initStore(storeInitializer),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(ImportCatalogComponent);
