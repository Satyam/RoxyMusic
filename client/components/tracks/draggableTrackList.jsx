import React, { PropTypes } from 'react';
import { getTracks } from '_store/actions';
import initStore from '_utils/initStore';

import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';

import {
  SortableContainer as DragContainer,
  SortableElement as DragElement,
  arrayMove,
} from 'react-sortable-hoc';

import Track from './track';
import styles from './styles.css';


const DraggableTrack = DragElement(props => (
  <ListGroupItem
    bsStyle={props.background && props.background[props.idTrack]}
  >
    <Track {...props} />
  </ListGroupItem>
));

const DraggableTrackList = DragContainer(({
  idTracks,
  Toolbar,
  background,
  dragIndex,
}) => (
  <ListGroup>
    {idTracks.map((idTrack, index) => (
      <DraggableTrack
        key={idTrack}
        index={index}
        idTrack={idTrack}
        Toolbar={Toolbar}
        background={background && background[idTrack]}
        dragged={dragIndex === index}
      />
    ))}
  </ListGroup>
));

export function DraggableTrackListComponent({
  idTracks,
  background,
  onDragEnd,
  Toolbar,
}) {
  const onSortEnd = ({ oldIndex, newIndex }) =>
    onDragEnd(arrayMove(idTracks, oldIndex, newIndex));
  return (idTracks.length || null) && (
    <DraggableTrackList
      idTracks={idTracks}
      Toolbar={Toolbar}
      background={background}
      pressDelay={200}
      helperClass={styles.draggedTrack}
      onSortEnd={onSortEnd}
      shouldCancelStart={() => (typeof onDragEnd !== 'function')}
    />
  );
}

DraggableTrackListComponent.propTypes = {
  idTracks: PropTypes.arrayOf(
    PropTypes.number
  ),
  background: PropTypes.objectOf(PropTypes.string),
  onDragEnd: PropTypes.func,
  Toolbar: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.func,
    PropTypes.oneOf(['default']),
  ]),
};

export const storeInitializer = (dispatch, getState, { idTracks }) => dispatch(getTracks(idTracks));

export default initStore(storeInitializer)(DraggableTrackListComponent);
