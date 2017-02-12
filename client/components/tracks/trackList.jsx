import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { getTracks } from '_store/actions';
import { trackSelectors } from '_store/selectors';
import initStore from '_utils/initStore';

import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import Icon from '_components/misc/icon';

import Track from './track';

export function TrackListComponent({
  idTracks,
  Toolbar,
  background,
  onMoreClick,
}) {
  return (
    <ListGroup>
      {idTracks.map(idTrack => (
        <ListGroupItem
          bsStyle={background && background[idTrack]}
        >
          <Track
            key={idTrack}
            idTrack={idTrack}
            Toolbar={Toolbar}
          />
        </ListGroupItem>
      ))}
      {
        onMoreClick
        ? (
          <ListGroupItem>
            <Icon
              button
              block
              type="menu-down"
              label="More"
              onClick={onMoreClick}
            />
          </ListGroupItem>
        )
        : null
      }
    </ListGroup>
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
  onMoreClick: PropTypes.func,
};

export const storeInitializer = (dispatch, state, { idTracks }) => dispatch(getTracks(idTracks));

export const mapStateToProps = (state, { idTracks, sorted }) => ({
  idTracks: trackSelectors.idTracks(state, idTracks, sorted),
});

export default compose(
  initStore(storeInitializer),
  connect(mapStateToProps),
)(TrackListComponent);
