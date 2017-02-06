import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import { diffArrays } from 'diff';

import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import Icon from '_components/misc/icon';
import Table from 'react-bootstrap/lib/Table';

import {
  goBack,
} from '_store/actions';

import {
  syncSelectors,
} from '_store/selectors';

import styles from './index.css';
// console.log(diffArrays('1,3,5,7'.split(','), '3,4'.split(',')));

// [ { count: 1, added: undefined, removed: true, value: [ '1' ] },
//   { count: 1, value: [ '3' ] },
//   { count: 2, added: undefined, removed: true, value: [ '5', '7' ] },
//   { count: 1, added: true, removed: undefined, value: [ '4' ] } ]
export function PlayListDiffComponent({
  client,
  server,
  onDone,
}) {
  const diffs = diffArrays(client.idTracks, server.idTracks);
  return (
    <ListGroup>
      <ListGroupItem>
        <div className={styles.heading}>
          5 of 5: Importing music files
        </div>
      </ListGroupItem>
      <ListGroupItem>
        <Table bordered condensed hover responsive>
          <thead>
            <tr>
              <th>Tablet</th>
              <th>Server</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              (
                client.name === server.name
                ? (<td colSpan="2">{client.name}</td>)
                : (<td>{client.name}</td><td>{server.name}</td>)
              )
            </tr>
            {[
              (<tr>
                <td className={styles.newer}>{client.lastUpdated}</td>
                <td className={styles.older}>{server.lastUpdated}</td>
              </tr>),
              (<tr><td colSpan="2">Update date match: {client.lastUpdated}</td></tr>),
              (<tr>
                <td className={styles.older}>{client.lastUpdated}</td>
                <td className={styles.newer}>{server.lastUpdated}</td>
              </tr>),
            ][Math.sign(Date.parse(client.lastUpdated) - Date.parse(server.lastUpdated)) + 1]
            }
            {diffs.map(diff =>
              ((diff.added || null) && diff.values.map(v => (
                <tr>
                  <td className={styles.missing} />
                  <td className={styles.added}>{v}</td>
                </tr>
              ))) ||
              ((diff.removed || null) && diff.values.map(v => (
                <tr>
                  <td className={styles.added}>{v}</td>
                  <td className={styles.missing} />
                </tr>
              ))) ||
              diff.values.map(v => (
                <tr>
                  <td colSpan="2">{v}</td>
                </tr>
              ))
            )}
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
        />
      </ListGroupItem>
    </ListGroup>
  );
}

PlayListDiffComponent.propTypes = {
  server: PropTypes.shape({
    name: PropTypes.string,
    idTracks: PropTypes.arrayOf(PropTypes.number),
    lastUpdated: PropTypes.string,
  }),
  client: PropTypes.shape({
    name: PropTypes.string,
    idTracks: PropTypes.arrayOf(PropTypes.number),
    lastUpdated: PropTypes.string,
  }),
  onDone: PropTypes.func,
};

export const mapStateToProps = (state, props) =>
  syncSelectors.sideBySideItem(state, props.params.idPlayList);

export const mapDispatchToProps = dispatch => ({
  onDone: () => dispatch(goBack()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PlayListDiffComponent);
