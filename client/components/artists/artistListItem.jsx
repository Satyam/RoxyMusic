import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import FoldingToolbar from '_components/misc/foldingToolbar';
// import Icon from '_components/misc/icon';
// import Button from 'react-bootstrap/lib/Button';
import styles from './artistListItem.css';

export const ArtistListItemComponent = ({ idArtist, artist, numTracks }) => (
  <ListGroupItem className={styles.li}>
    <div className={styles.left}>
      <div className={styles.artist}>
        <Link to={`/artists/${idArtist}`}>
          {artist}
        </Link>
      </div>
      <div className={styles.numTracks}>
        {numTracks} tracks
      </div>
    </div>
    <FoldingToolbar>
      {/*
      <Button onClick={console.log.bind(console, 'play')}><Icon type="play" /></Button>
      <Button onClick={console.log.bind(console, 'up')}><Icon type="arrow-up" /></Button>
      <Button onClick={console.log.bind(console, 'otro')}>otro</Button>
      */}
    </FoldingToolbar>
  </ListGroupItem>
);


ArtistListItemComponent.propTypes = {
  idArtist: PropTypes.number.isRequired,
  artist: PropTypes.string,
  numTracks: PropTypes.number,
};

export const mapStateToProps = (state, props) => state.artists.artistHash[props.idArtist] || {};

export default connect(
  mapStateToProps
)(ArtistListItemComponent);
