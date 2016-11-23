import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { getTracks } from '_store/actions';
import initStore from '_utils/initStore';
import renderAttr from '_components/misc/renderAttr';
import pick from 'lodash/pick';
import sortBy from 'lodash/sortBy';
import map from 'lodash/map';

import ListGroup from 'react-bootstrap/lib/ListGroup';
import styles from './trackList.css';
import Track from './track';

function sortIdTracks(sorted, idTracks, tracks) {
  if (!sorted) return idTracks;
  if (!Object.keys(tracks).length) return null;
  return map(
    sortBy(
      pick(tracks, idTracks),
      track => track.title + track.album + track.track
    ),
    track => track.idTrack
  );
}

export function TrackListComponent({
  idTracks,
  tracks,
  Toolbar,
  background,
  Before,
  After,
  sorted,
}) {
  const idt = sortIdTracks(sorted, idTracks, tracks);
  return (idt || null) && (
    <div className={styles.trackList}>
      <ListGroup>
        {renderAttr(Before)}
        {idt.map(idTrack => (
          <Track
            key={idTrack}
            idTrack={idTrack}
            Toolbar={Toolbar}
            background={background && background[idTrack]}
          />
        ))}
        {renderAttr(After)}
      </ListGroup>
    </div>
  );
}

TrackListComponent.propTypes = {
  idTracks: PropTypes.arrayOf(
    PropTypes.number
  ),
  tracks: PropTypes.objectOf(
    PropTypes.object
  ),
  Toolbar: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.func,
    PropTypes.oneOf(['default']),
  ]),
  background: PropTypes.objectOf(PropTypes.string),
  Before: PropTypes.element,
  After: PropTypes.element,
  sorted: PropTypes.bool,
};

export const storeInitializer = (dispatch, state, props) => dispatch(getTracks(props.idTracks));

export const mapStateToProps = state => state;

export default compose(
  initStore(storeInitializer),
  connect(mapStateToProps),
)(TrackListComponent);
