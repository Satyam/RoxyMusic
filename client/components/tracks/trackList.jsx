import React, { PropTypes } from 'react';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import styles from './trackList.css';
import Track from './track';

export default function TrackList({ idTracks }) {
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

TrackList.propTypes = {
  idTracks: PropTypes.arrayOf(
    PropTypes.number
  ),
};
