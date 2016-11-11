import React, { PropTypes } from 'react';
import { compose } from 'recompose';
import { getTracks } from '_store/actions';
import initStore from '_utils/initStore';

import ListGroup from 'react-bootstrap/lib/ListGroup';
import styles from './trackList.css';
import Track from './track';

export function TrackListComponent({ idTracks }) {
  return (idTracks || null) && (
    <div className={styles.trackList}>
      <ListGroup>{
        idTracks.map(idTrack => (
          <Track
            key={idTrack}
            idTrack={idTrack}
          />
        ))
      }</ListGroup>
    </div>
  );
}

TrackListComponent.propTypes = {
  idTracks: PropTypes.arrayOf(
    PropTypes.number
  ),
};

export const storeInitializer = (dispatch, state, props) => dispatch(getTracks(props.idTracks));

export default compose(
  initStore(storeInitializer),
)(TrackListComponent);
