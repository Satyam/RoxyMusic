import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import isPlainClick from '_utils/isPlainClick';
import { getTracks, playNow } from '_store/actions';
import initStore from '_utils/initStore';
import Icon from '_components/misc/icon';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import renderAttr from '_components/misc/renderAttr';
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
        <div className={styles.trackNum}>{track || '_'}</div>
        <div className={styles.left}>
          <div className={styles.title}>{title}</div>
          <div className={styles.album}>
            <Icon type="cd" href={idAlbum && `/albums/${idAlbum}`} label={album || '--'} />
          </div>
          <div className={styles.artist}>
            <Icon type="user" href={idArtist && `/artists/${idArtist}`} label={artist || '--'} />
          </div>
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
  return state.tracks[idTrack] || dispatch(getTracks(idTrack));
};

export const mapStateToProps = (state, props) => state.tracks[props.idTrack] || {};

export const mapDispatchToProps = (dispatch, props) => ({
  onPlayClick: ev => isPlainClick(ev) && dispatch(playNow(props.idTrack)),
});

export default compose(
  initStore(storeInitializer),
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
)(TrackComponent);
