import React, { PropTypes } from 'react';
import styles from './trackList.css';
import Track from './track';

export default function TrackList({ idTracks }) {
  return (idTracks || null) && (
    <div className={styles.trackList}>
      <ul>{
        idTracks.map(idTrack => (
          <Track
            key={idTrack}
            idTrack={idTrack}
          />
        ))
      }</ul>
    </div>
  );
}

TrackList.propTypes = {
  idTracks: PropTypes.arrayOf(
    PropTypes.number
  ),
};
