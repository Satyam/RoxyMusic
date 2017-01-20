import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { getTracks } from '_store/actions';
import initStore from '_utils/initStore';
import pick from 'lodash/pick';
import sortBy from 'lodash/sortBy';
import map from 'lodash/map';

import ListGroup from 'react-bootstrap/lib/ListGroup';

import {
  SortableContainer as DragContainer,
  SortableElement as DragElement,
  arrayMove,
} from 'react-sortable-hoc';

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

const DraggableTrack = DragElement(Track);
const DraggableTrackList = DragContainer(({
  idTracks,
  Toolbar,
  background,
  after,
}) => (
  <ListGroup>
    {idTracks.map((idTrack, index) => (
      <DraggableTrack
        key={idTrack}
        index={index}
        idTrack={idTrack}
        Toolbar={Toolbar}
        background={background && background[idTrack]}
      />
    ))}
    {after}
  </ListGroup>
));

export function TrackListComponent({
  idTracks,
  tracks,
  Toolbar,
  background,
  children,
  sorted,
}) {
  const idt = sortIdTracks(sorted, idTracks, tracks);
  return (idt.length || null) && (
    <div className={styles.trackList}>
      <DraggableTrackList
        idTracks={idt}
        Toolbar={Toolbar}
        background={background}
        after={children}
      />
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
  sorted: PropTypes.bool,
  children: PropTypes.node,
};

export const storeInitializer = (dispatch, state, props) => dispatch(getTracks(props.idTracks));

export const mapStateToProps = state => state;

export default compose(
  initStore(storeInitializer),
  connect(mapStateToProps),
)(TrackListComponent);
