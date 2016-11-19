import React, { PropTypes } from 'react';
import { compose } from 'recompose';
import { getTracks } from '_store/actions';
import initStore from '_utils/initStore';
import renderAttr from '_components/misc/renderAttr';

import ListGroup from 'react-bootstrap/lib/ListGroup';
import styles from './trackList.css';
import Track from './track';

export function TrackListComponent({
  idTracks,
  Toolbar,
  background,
  Before,
  After,
}) {
  return (idTracks || null) && (
    <div className={styles.trackList}>
      <ListGroup>
        {renderAttr(Before)}
        {
          idTracks.map(idTrack => (
            <Track
              key={idTrack}
              idTrack={idTrack}
              Toolbar={Toolbar}
              background={background && background[idTrack]}
            />
          ))
        }
        {renderAttr(After)}
      </ListGroup>
    </div>
  );
}

TrackListComponent.propTypes = {
  idTracks: PropTypes.arrayOf(
    PropTypes.number
  ),
  Toolbar: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.func,
    PropTypes.oneOf(['default']),
  ]),
  background: PropTypes.objectOf(PropTypes.string),
  Before: PropTypes.element,
  After: PropTypes.element,
};

export const storeInitializer = (dispatch, state, props) => dispatch(getTracks(props.idTracks));

export default compose(
  initStore(storeInitializer),
)(TrackListComponent);
