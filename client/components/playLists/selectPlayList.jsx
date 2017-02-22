import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';

import Panel from 'react-bootstrap/lib/Panel';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import HelpBlock from 'react-bootstrap/lib/HelpBlock';
import Modal from 'react-bootstrap/lib/Modal';
import Icon from '_components/misc/icon';
import TrackList from '_components/tracks/trackList';

import initStore from '_utils/initStore';
import {
  addTracksToPlayList,
  closeAddToPlayList,
  addTracksToNewPLaylist,
} from '_store/actions';
import { playListSelectors } from '_store/selectors';

import isPlainClick from '_utils/isPlainClick';
import bindHandlers from '_utils/bindHandlers';

import { storeInitializer } from './playLists';

export class SelectPlayListComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newName: '',
      duplicate: false,
    };
    bindHandlers(this);
  }
  onChangeHandler(ev) {
    const newName = ev.target.value;
    const playList = this.inList(newName);
    this.setState({
      newName,
      duplicate: playList && playList.idTracks.length,
    });
  }
  onSubmitHandler() {
    const newName = this.state.newName.trim();
    const playList = this.inList(newName);
    if (playList) {
      this.props.onAddToExistingPlayList(playList.idPlayList);
    } else {
      this.props.onAddToNewPlayList(newName);
    }
    this.setState({ newName: '' });
  }
  inList(newName) {
    const testName = newName.trim().toLowerCase();
    return this.props.list.find(
      playList => playList.name.toLowerCase() === testName
    );
  }
  render() {
    const {
      idTracksToAdd,
      duplicatesToAdd,
      list,
      onClose,
      onPlayListClick,
    } = this.props;

    return (
      <Modal show={idTracksToAdd !== null} onHide={onClose}>
        <Modal.Header>
          <Modal.Title>Select Playlist</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {
            duplicatesToAdd
            ? (
              <Panel
                header="These tracks are already in the playlist"
                bsStyle="danger"
              >
                <Icon
                  type="list"
                  href={`/playLists/${duplicatesToAdd.idPlayList}`}
                >
                  {duplicatesToAdd.name}
                </Icon>
                <TrackList
                  idTracks={duplicatesToAdd.idTracks}
                  sorted
                />
              </Panel>
            )
            : (
              <ListGroup>
                {
                  list.map(playList => (
                    playList.idTracks.length
                    ? (
                      <ListGroupItem
                        key={playList.idPlayList}
                        onClick={onPlayListClick(playList.idPlayList)}
                      >
                        {playList.name}
                      </ListGroupItem>
                    )
                    : null
                  ))
                }
                <ListGroupItem key="new">
                  <FormGroup validationState={this.state.duplicate ? 'warning' : null}>
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
                    {
                      this.state.duplicate
                      ? (<HelpBlock>Nombre ya existe.</HelpBlock>)
                      : null
                    }
                  </FormGroup>
                </ListGroupItem>
              </ListGroup>
            )
          }
        </Modal.Body>

        <Modal.Footer>
          <Icon
            type="remove"
            button
            onClick={onClose}
          >Close</Icon>
        </Modal.Footer>

      </Modal>
    );
  }
}

SelectPlayListComponent.propTypes = {
  idTracksToAdd: PropTypes.arrayOf(
    PropTypes.number
  ),
  duplicatesToAdd: PropTypes.object,
  list: PropTypes.arrayOf(PropTypes.object),
  onPlayListClick: PropTypes.func,
  onAddToNewPlayList: PropTypes.func,
  onAddToExistingPlayList: PropTypes.func,
  onClose: PropTypes.func,
};

export const mapStateToProps = state => ({
  list: playListSelectors.orderedList(state),
  idTracksToAdd: playListSelectors.tracksToAdd(state),
  duplicatesToAdd: playListSelectors.duplicatesToAdd(state),
});

export const mapDispatchToProps = dispatch => ({
  onPlayListClick: idPlayList => ev =>
    isPlainClick(ev)
    && dispatch(addTracksToPlayList(idPlayList)),
  onAddToNewPlayList: name =>
    dispatch(addTracksToNewPLaylist(name)),
  onAddToExistingPlayList: idPlayList =>
    dispatch(addTracksToPlayList(idPlayList)),
  onClose: () => dispatch(closeAddToPlayList()),
});

const enhance = compose(
  initStore(storeInitializer),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
);

export default enhance(SelectPlayListComponent);
