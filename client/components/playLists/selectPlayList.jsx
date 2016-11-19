import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import sortBy from 'lodash/sortBy';

import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import Modal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';
import Icon from '_components/misc/icon';

import initStore from '_utils/initStore';
import { addTrackToPlaylist, closeAddToPlaylist, addPlayList } from '_store/actions';
import isPlainClick from '_utils/isPlainClick';
import bindHandlers from '_utils/bindHandlers';

import { storeInitializer, mapStateToProps } from './playLists';

export class SelectPlaylistComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { newName: '' };
    bindHandlers(this);
  }
  onChangeHandler(ev) {
    this.setState({ newName: ev.target.value });
  }
  onSubmitHandler(ev) {
    if (isPlainClick(ev)) {
      const {
        idTrackToAdd,
        onAddToNewPlaylist,
      } = this.props;
      onAddToNewPlaylist(idTrackToAdd, this.state.newName);
      this.setState({ newName: '' });
    }
  }

  render() {
    const {
      idTrackToAdd,
      hash,
      onClose,
      onPlayListClick,
    } = this.props;

    return (
      <Modal show={idTrackToAdd !== null} onHide={onClose}>
        <Modal.Header>
          <Modal.Title>Select Playlist</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <ListGroup>
            {
              sortBy(hash, playList => playList.name).map(playList => (
                <ListGroupItem
                  key={playList.idPlayList}
                  onClick={onPlayListClick(idTrackToAdd, playList.idPlayList)}
                >
                  {playList.name}
                </ListGroupItem>
              ))
            }
            <ListGroupItem key="new">
              <FormGroup>
                <InputGroup>
                  <InputGroup.Addon>New Playlist</InputGroup.Addon>
                  <FormControl
                    type="text"
                    value={this.state.value}
                    placeholder="Enter name"
                    onChange={this.onChangeHandler}
                  />
                  <InputGroup.Addon>
                    <Icon
                      type="plus"
                      disabled={!this.state.newName.length}
                      onClick={this.onSubmitHandler}
                      label="Add"
                    />
                  </InputGroup.Addon>
                </InputGroup>
              </FormGroup>
            </ListGroupItem>
          </ListGroup>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={onClose}>Close</Button>
        </Modal.Footer>

      </Modal>
    );
  }
}

SelectPlaylistComponent.propTypes = {
  idTrackToAdd: PropTypes.number,
  hash: PropTypes.objectOf(PropTypes.object),
  onPlayListClick: PropTypes.func,
  onAddToNewPlaylist: PropTypes.func,
  onClose: PropTypes.func,
};

export const mapDispatchToProps = dispatch => ({
  onPlayListClick: (idTrackToAdd, idPlayList) => ev =>
    isPlainClick(ev)
    && dispatch(addTrackToPlaylist(idTrackToAdd, idPlayList))
    .then(() => dispatch(closeAddToPlaylist())),
  onAddToNewPlaylist: (idTrackToAdd, name) =>
    dispatch(addPlayList(name))
    .then(res => dispatch(addTrackToPlaylist(idTrackToAdd, res.payload.lastID))
    .then(() => dispatch(closeAddToPlaylist()))
  ),
  onClose: ev => isPlainClick(ev) && dispatch(closeAddToPlaylist()),
});

const enhance = compose(
  initStore(storeInitializer),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
);

export default enhance(SelectPlaylistComponent);
