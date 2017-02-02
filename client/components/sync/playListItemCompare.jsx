import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import bindHandlers from '_utils/bindHandlers';

import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import Radio from 'react-bootstrap/lib/Radio';

import Icon from '_components/misc/icon';

import {
  setActionForSync,
  TRANSFER_ACTION,
} from '_store/actions';

import styles from './index.css';

export class PlayListItemCompareComponent extends Component {
  constructor(props) {
    super(props);
    this.state = this.guessAction(props);
    bindHandlers(this);
  }
  componentWillReceiveProps(newProps) {
    this.setState(this.guessAction(newProps));
  }
  onOptionChangeHandler(ev) {
    const action = parseInt(ev.target.value, 10);
    this.props.onActionChange(action);
    this.setState({ action });
  }
  guessAction({ client, server }) {
    // signature will be calculated on the reducer
    // check whether the actual playlist is needed or just the signature
    // let the action be calculated on the reducer
    // check whether changing the action on the store forces a refresh
    //   so that the action doesn't need to go into the state, only inthe store.

    let send;
    let importIt;
    let delClient;
    let delServer;
    let comment;
    if (client.signature) {
      if (server.signature) {
        if (client.signature !== server.signature) {
          send = true;
          importIt = true;
          comment = 'Tablet and server playlists are different. ';
          if (server.lastUpdated < client.lastUpdated) {
            comment += 'Tablet version is newer.';
          } else {
            comment += 'Server version is newer.';
          }
        } else {
          comment = 'They match';
        }
      } else {
        comment = 'Playlist was created new on the tablet. Needs sending to the server.';
        send = true;
        delClient = true;
      }
    } else if (server.signature) {
      comment = 'Playlist is new on the server. Needs importing to the tablet.';
      importIt = true;
      delServer = true;
    }
    return {
      send,
      import: importIt,
      delClient,
      delServer,
      comment,
    };
  }
  render() {
    const state = this.state;
    const props = this.props;
    const action = props.action;
    const idPlayList = this.props.idPlayList;
    const name = (props.client && props.client.name) || (props.server && props.server.name);
    return (<ListGroupItem>
      <strong>{name}</strong>
      <table className={styles.table}>
        <tbody>
          <tr>
            <td>
              <FormGroup>
                {
                  state.send
                  ? (
                    <Radio
                      checked={action === TRANSFER_ACTION.SEND}
                      onChange={this.onOptionChangeHandler}
                      name={idPlayList}
                      value={TRANSFER_ACTION.SEND}
                    >Send to server</Radio>)
                  : null
                }
                {
                  state.import
                  ? (
                    <Radio
                      checked={action === TRANSFER_ACTION.IMPORT}
                      onChange={this.onOptionChangeHandler}
                      name={idPlayList}
                      value={TRANSFER_ACTION.IMPORT}
                    >Import from server</Radio>)
                  : null
                }
                {
                  state.delClient
                  ? (
                    <Radio
                      checked={action === TRANSFER_ACTION.DEL_CLIENT}
                      onChange={this.onOptionChangeHandler}
                      name={idPlayList}
                      value={TRANSFER_ACTION.DEL_CLIENT}
                    >Delete on tablet</Radio>)
                  : null
                }
                {
                  state.delServer
                  ? (
                    <Radio
                      checked={action === TRANSFER_ACTION.DEL_SERVER}
                      onChange={this.onOptionChangeHandler}
                      name={idPlayList}
                      value={TRANSFER_ACTION.DEL_SERVER}
                    >Delete on server</Radio>)
                  : null
                }
                <Radio
                  checked={action === TRANSFER_ACTION.DO_NOTHING}
                  onChange={this.onOptionChangeHandler}
                  name={idPlayList}
                  value={TRANSFER_ACTION.DO_NOTHING}
                >Do nothing</Radio>
              </FormGroup>
            </td>
            <td>
              {
                state.send && state.import
                ? (
                  <Icon
                    button
                    type="transfer"
                    title="Show Difference w/server"
                  />
                )
                : null
              }
            </td>
            <td>
              {state.comment}
            </td>
          </tr>
        </tbody>
      </table>
    </ListGroupItem>);
  }
}

PlayListItemCompareComponent.propTypes = {
  server: PropTypes.shape({
    name: PropTypes.string,
    idTracks: PropTypes.arrayOf(PropTypes.number),
    idDevice: PropTypes.number,
    lastUpdated: PropTypes.string,
  }),
  client: PropTypes.shape({
    name: PropTypes.string,
    idTracks: PropTypes.arrayOf(PropTypes.number),
    idDevice: PropTypes.number,
    lastUpdated: PropTypes.string,
  }),
  onActionChange: PropTypes.func,
  idPlayList: PropTypes.string,
};

export const mapStateToProps = (state, props) => state.sync.hash[props.idPlayList];

export const mapDispatchToProps = (dispatch, { idPlayList }) => ({
  onActionChange: action => dispatch(setActionForSync(idPlayList, action)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PlayListItemCompareComponent);
