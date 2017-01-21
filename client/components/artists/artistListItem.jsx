import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Artist } from '_components/entries';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
// import FoldingToolbar from '_components/misc/foldingToolbar';
// import Icon from '_components/misc/icon';

import styles from './artistListItem.css';

export const ArtistListItemComponent = ({ idArtist, artist, numTracks }) => (
  <ListGroupItem className={styles.li}>
    <div className={styles.left}>
      <Artist
        className={styles.artist}
        idArtist={idArtist}
        artist={artist}
      >
        <div className={styles.numTracks}>
          {numTracks} tracks
        </div>
      </Artist>
    </div>
  </ListGroupItem>
);


ArtistListItemComponent.propTypes = {
  idArtist: PropTypes.number.isRequired,
  artist: PropTypes.string,
  numTracks: PropTypes.number,
};

export const mapStateToProps = (state, props) => state.artists.hash[props.idArtist] || {};

export default connect(
  mapStateToProps
)(ArtistListItemComponent);
