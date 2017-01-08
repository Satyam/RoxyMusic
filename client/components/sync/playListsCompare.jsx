import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import map from 'lodash/map';

import Icon from '_components/misc/icon';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';

import {
  getMissingTracks,
} from '_store/actions';

import PlayListOnServerIsNew from './playListOnServerIsNew';

export function PlayListCompareComponent({
  idDevice,
  hash,
  onDone,
}) {
  return (<div>
    <ListGroup>
      {
        map(hash, (playList, idPlayList) => {
          if (playList.serverName && !playList.previousName && !playList.name) {
            return (
              <PlayListOnServerIsNew
                key={playList.idPlayList}
                idDevice={idDevice}
                playList={playList}
              />
            );
          }
          return (
            <ListGroupItem
              key={idPlayList}
              header={playList.name}
              bsStyle="warning"
            >
              {JSON.stringify(playList)}
            </ListGroupItem>
          );
        })
      }
      <ListGroupItem>
        <Icon
          className="btn btn-default btn-block"
          type="ok"
          onClick={onDone}
          label="Done"
        />
      </ListGroupItem>
    </ListGroup>
  </div>);
}

PlayListCompareComponent.propTypes = {
  idDevice: PropTypes.number,
  hash: PropTypes.object,
  onDone: PropTypes.func,
};

export const mapStateToProps = state => state.sync;

export const mapDispatchToProps = dispatch => ({
  onDone: () => dispatch(getMissingTracks()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PlayListCompareComponent);
