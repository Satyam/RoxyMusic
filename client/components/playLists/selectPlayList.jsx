import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import sortBy from 'lodash/sortBy';
import some from 'lodash/some';

import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import HelpBlock from 'react-bootstrap/lib/HelpBlock';
import Modal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';
import Icon from '_components/misc/icon';

import initStore from '_utils/initStore';
import { addTracksToPlayList, closeAddToPlayList, addPlayList } from '_store/actions';
import isPlainClick from '_utils/isPlainClick';
import bindHandlers from '_utils/bindHandlers';

import { storeInitializer, mapStateToProps } from './playLists';

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
    const testName = newName.trim().toLowerCase();
    this.setState({
      newName,
      duplicate: some(
        this.props.hash,
        playList => playList.name.toLowerCase() === testName
      ),
    });
  }
  onSubmitHandler(ev) {
    if (isPlainClick(ev)) {
      const {
        idTracksToAdd,
        onAddToNewPlayList,
      } = this.props;
      onAddToNewPlayList(idTracksToAdd, this.state.newName);
      this.setState({ newName: '' });
    }
  }

  render() {
    const {
      idTracksToAdd,
      hash,
      onClose,
      onPlayListClick,
    } = this.props;

    return (
      <Modal show={idTracksToAdd !== null} onHide={onClose}>
        <Modal.Header>
          <Modal.Title>Select Playlist</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <ListGroup>
            {
              sortBy(hash, playList => playList.name).map(playList => (
                <ListGroupItem
                  key={playList.idPlayList}
                  onClick={onPlayListClick(idTracksToAdd, playList.idPlayList)}
                >
                  {playList.name}
                </ListGroupItem>
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
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={onClose}>Close</Button>
        </Modal.Footer>

      </Modal>
    );
  }
}

SelectPlayListComponent.propTypes = {
  idTracksToAdd: PropTypes.arrayOf(
    PropTypes.number
  ),
  hash: PropTypes.objectOf(PropTypes.object),
  onPlayListClick: PropTypes.func,
  onAddToNewPlayList: PropTypes.func,
  onClose: PropTypes.func,
};

export const mapDispatchToProps = dispatch => ({
  onPlayListClick: (idTracksToAdd, idPlayList) => ev =>
    isPlainClick(ev)
    && dispatch(addTracksToPlayList(idTracksToAdd, idPlayList))
    .then(() => dispatch(closeAddToPlayList())),
  onAddToNewPlayList: (idTracksToAdd, name) =>
    dispatch(addPlayList(name, [idTracksToAdd]))
    .then(() => dispatch(closeAddToPlayList())),
  onClose: ev => isPlainClick(ev) && dispatch(closeAddToPlayList()),
});

const enhance = compose(
  initStore(storeInitializer),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
);

export default enhance(SelectPlayListComponent);
