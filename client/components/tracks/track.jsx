import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import { trackSelectors } from '_store/selectors';

import renderAttr from '_components/misc/renderAttr';
import { Song, Album, Artist } from '_components/entries';
import styles from './styles.css';
import DefaultToolbar from './defaultTracksToolbar';

export const TrackComponent = ({
  idTrack,
  title,
  artist,
  idArtist,
  album,
  idAlbum,
  track,
  error,
  Toolbar,
}) =>
  (idTrack || null) && (
    error === 404
    ? (<div className={styles.notFound}>Track for that URL no longer exists</div>)
    : (
      <div className={styles.track}>

        <div className={styles.left}>
          <Song
            className={styles.title}
            title={title}
          />
          <Album
            className={styles.album}
            idAlbum={idAlbum}
            album={album}
          >
            {track && ` (# ${track})`}
          </Album>
          <Artist
            className={styles.artist}
            idArtist={idArtist}
            artist={artist}
          />
        </div>
        {renderAttr(Toolbar === 'default' ? DefaultToolbar : Toolbar, { idTrack })}
      </div>
    )
  );

TrackComponent.propTypes = {
  idTrack: PropTypes.number,
  title: PropTypes.string,
  artist: PropTypes.string,
  idArtist: PropTypes.number,
  album: PropTypes.string,
  idAlbum: PropTypes.number,
  track: PropTypes.number,
  Toolbar: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.func,
    PropTypes.oneOf(['default']),
  ]),

};

export const mapStateToProps = (state, props) => trackSelectors.item(state, props.idTrack);

export default connect(
    mapStateToProps
)(TrackComponent);
