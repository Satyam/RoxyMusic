import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import isPlainClick from '_utils/isPlainClick';

import { getTracks, playNow } from '_store/actions';
import { trackSelectors } from '_store/selectors';

import initStore from '_utils/initStore';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import renderAttr from '_components/misc/renderAttr';
import { Song, Album, Artist } from '_components/entries';
import styles from './track.css';
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
  background,
}) =>
  (idTrack || null) && (
    error === 404
    ? (<div className={styles.notFound}>Track for that URL no longer exists</div>)
    : (
      <ListGroupItem className={styles.track} bsStyle={background}>
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
      </ListGroupItem>
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

  background: PropTypes.string,
};

export const storeInitializer = (dispatch, state, props) => {
  const idTrack = props.idTrack;
  return trackSelectors.exists(state, idTrack) || dispatch(getTracks(idTrack));
};

export const mapStateToProps = (state, props) => trackSelectors.item(state, props.idTrack);

export const mapDispatchToProps = (dispatch, { idTrack }) => ({
  onPlayClick: ev => isPlainClick(ev) && dispatch(playNow(idTrack)),
});

export default compose(
  initStore(storeInitializer),
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
)(TrackComponent);
