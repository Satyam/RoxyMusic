import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import initStore from '_utils/initStore';

import { diffArrays } from 'diff';

import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import Icon from '_components/misc/icon';
import Table from 'react-bootstrap/lib/Table';


import {
  goBack,
  getTracksToDiff,
} from '_store/actions';

import {
  syncSelectors,
} from '_store/selectors';

import styles from './styles.css';
// console.log(diffArrays('1,3,5,7'.split(','), '3,4'.split(',')));

// [ { count: 1, added: undefined, removed: true, value: [ '1' ] },
//   { count: 1, value: [ '3' ] },
//   { count: 2, added: undefined, removed: true, value: [ '5', '7' ] },
//   { count: 1, added: true, removed: undefined, value: [ '4' ] } ]
export function PlayListDiffComponent({
  client,
  server,
  tracks,
  onDone,
}) {
  const diffs = diffArrays(client.idTracks, server.idTracks);
  const trackInfo = idTrack => ((tracks && tracks[idTrack]) || null) &&
    (<div>
      <div className={styles.trackTitle}>{tracks[idTrack].title}</div>
      <div className={styles.trackAlbum}>{tracks[idTrack].album}</div>
      <div className={styles.trackArtist}>{tracks[idTrack].artist}</div>
    </div>);

  return (
    <ListGroup>
      <ListGroupItem>
        <div className={styles.heading}>
          Difference in Playlist contents
        </div>
      </ListGroupItem>
      <ListGroupItem>
        <Table className={styles.centeredTable} bordered condensed hover responsive>
          <thead className={styles.thead}>
            <tr>
              <th colSpan="2">Tablet</th>
              <th colSpan="2">Server</th>
            </tr>
          </thead>
          <tbody>
            <tr><th colSpan="4" className={styles.headingRow}>Name</th></tr>
            {
              client.name === server.name
              ? (<tr><td colSpan="4">{client.name}</td></tr>)
              : (<tr><td colSpan="2">{client.name}</td><td colSpan="2">{server.name}</td></tr>)
            }
            <tr><th colSpan="4" className={styles.headingRow}>Update Dates</th></tr>
            {
              [
                (<tr>
                  <td colSpan="2" className={styles.older}>{client.lastUpdated}</td>
                  <td colSpan="2" className={styles.newer}>{server.lastUpdated}</td>
                </tr>),
                (<tr><td colSpan="4">Update date match: {client.lastUpdated}</td></tr>),
                (<tr>
                  <td colSpan="2" className={styles.newer}>{client.lastUpdated}</td>
                  <td colSpan="2" className={styles.older}>{server.lastUpdated}</td>
                </tr>),
              ][Math.sign(Date.parse(client.lastUpdated) - Date.parse(server.lastUpdated)) + 1]
            }
            <tr><th colSpan="4" className={styles.headingRow}>Tracks</th></tr>
            {diffs.map(diff =>
              ((diff.added || null) && diff.value.map(idTrack => (
                <tr>
                  <td className={styles.missing}>-</td>
                  <td colSpan="2" className={styles.trackInfo}>{trackInfo(idTrack)}</td>
                  <td className={styles.added}>+</td>
                </tr>
              ))) ||
              ((diff.removed || null) && diff.value.map(idTrack => (
                <tr>
                  <td className={styles.added}>+</td>
                  <td colSpan="2" className={styles.trackInfo}>{trackInfo(idTrack)}</td>
                  <td className={styles.missing}>-</td>
                </tr>
              ))) ||
              diff.value.map(idTrack => (
                <tr>
                  <td className={styles.same}>=</td>
                  <td colSpan="2" className={styles.trackInfo}>{trackInfo(idTrack)}</td>
                  <td className={styles.same}>=</td>
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
  tracks: PropTypes.object,
  onDone: PropTypes.func,
};
export const storeInitializer = (dispatch, state, props) =>
  dispatch(getTracksToDiff(props.params.idPlayList));

export const mapStateToProps = (state, props) =>
  syncSelectors.sideBySideItem(state, props.params.idPlayList);

export const mapDispatchToProps = dispatch => ({
  onDone: () => dispatch(goBack()),
});

export default compose(
  initStore(storeInitializer),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(PlayListDiffComponent);
