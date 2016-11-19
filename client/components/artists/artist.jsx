import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Navbar from 'react-bootstrap/lib/Navbar';
import Icon from '_components/misc/icon';
import compose from 'recompose/compose';
import { getArtist } from '_store/actions';
import initStore from '_utils/initStore';
import TrackList from '_components/tracks/trackList';
import styles from './artist.css';

export const ArtistComponent = ({ idArtist, artist, numTracks, idTracks, error }) =>
  (idArtist || null) && (
    error === 404
    ? (<div className={styles.notFound}>Artist for that URL no longer exists</div>)
    : (
      <div className={styles.artist}>
        <Navbar>
          <Navbar.Header>
            <Navbar.Brand>
              <Icon type="arrow-up" href="/" label="  " />
              <Icon type="user" label={artist} />
            </Navbar.Brand>
          </Navbar.Header>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <div className={styles.artistInfo}>
              <div className={styles.artistNumTracks}>
                {numTracks} {numTracks === 1 ? 'track' : 'tracks'}
              </div>
            </div>
          </Navbar.Collapse>
        </Navbar>
        <TrackList idTracks={idTracks} Toolbar="default" />
      </div>
    )
  );


ArtistComponent.propTypes = {
  idArtist: PropTypes.number,
  artist: PropTypes.string,
  numTracks: PropTypes.number,
  idTracks: PropTypes.arrayOf(
    PropTypes.number
  ),
  error: PropTypes.number,
};

export const storeInitializer = (dispatch, state, props) => {
  const idArtist = props.params.idArtist;
  return state.artists.artistHash[idArtist] || dispatch(getArtist(idArtist));
};

export const mapStateToProps =
  (state, props) => state.artists.artistHash[props.params.idArtist] || {};

export default compose(
  initStore(storeInitializer),
  connect(
    mapStateToProps
  )
)(ArtistComponent);
