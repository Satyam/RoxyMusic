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
  importCatalog,
} from '_store/actions';

import { syncSelectors } from '_store/selectors';

import styles from './index.css';

export function ImportCatalogComponent({
  catalogImportStage,
}) {
  const total = 9;
  return (<div>
    <ListGroup>
      <ListGroupItem>
        <div className={styles.heading}>
          4 of 5: Importing catalog info
        </div>
      </ListGroupItem>
      <ListGroupItem>
        <ProgressBar
          now={catalogImportStage}
          label={`${catalogImportStage} of ${total}`}
          striped
          max={total}
          bsStyle="info"
        />
      </ListGroupItem>
      <ListGroupItem>
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
      </ListGroupItem>
    </ListGroup>
  </div>);
}

ImportCatalogComponent.propTypes = {
  catalogImportStage: PropTypes.number,
};

export const storeInitializer = dispatch => dispatch(importCatalog());

export const mapStateToProps = state => ({
  catalogImportStage: syncSelectors.catalogImportStage(state),
});

export default compose(
  initStore(storeInitializer),
  connect(
    mapStateToProps,
  )
)(ImportCatalogComponent);
