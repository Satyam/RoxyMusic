import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import bindHandlers from '_utils/bindHandlers';
import isPlainClick from '_utils/isPlainClick';

import FormGroup from 'react-bootstrap/lib/FormGroup';
import Radio from 'react-bootstrap/lib/Radio';

import Icon from '_components/misc/icon';

import {
  setActionForSync,
  TRANSFER_ACTION,
  push,
} from '_store/actions';

import {
  syncSelectors,
} from '_store/selectors';

import styles from './styles.css';

export function guessAction({ client, server }) {
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
  let show = true;
  let showDiff = false;
  if (client.signature) {
    if (server.signature) {
      if (client.signature !== server.signature) {
        send = true;
        importIt = true;
        showDiff = !client.empty && !server.empty;
        comment = 'Tablet and server playlists are different. ';
        if (server.lastUpdated < client.lastUpdated) {
          if (client.empty) {
            comment += 'Playlist was deleted on the tablet';
          } else if (server.empty) {
            comment = 'Playlist is new';
          } else {
            comment += 'Tablet version is newer.';
          }
        } else if (server.empty) {
          comment += 'PlayList was deleted on the server';
        } else if (client.empty) {
          comment = 'Previously deleted playlist was changed in the server';
        } else {
          comment += 'Server version is newer.';
        }
      } else {
        comment = 'They match';
      }
    } else {
      comment = 'Playlist was created new on the tablet. Needs sending to the server.';
      if (client.empty) show = false;
      send = true;
      delClient = true;
    }
  } else if (server.signature) {
    comment = 'Playlist is new on the server. Needs importing to the tablet.';
    if (server.empty) show = false;
    importIt = true;
    delServer = true;
  }
  return {
    send,
    import: importIt,
    delClient,
    delServer,
    comment,
    show,
    showDiff,
  };
}

export class PlayListItemCompareComponent extends Component {
  constructor(props) {
    super(props);
    this.state = guessAction(props);
    bindHandlers(this);
  }
  componentWillReceiveProps(newProps) {
    this.setState(guessAction(newProps));
  }
  onOptionChangeHandler(ev) {
    const action = parseInt(ev.target.value, 10);
    this.props.onActionChange(action);
    this.setState({ action });
  }
  onShowDiffHandler(ev) {
    if (isPlainClick(ev)) {
      this.props.onShowDiff(this.props.idPlayList);
    }
  }
  render() {
    const state = this.state;
    const props = this.props;
    const action = props.action;
    const idPlayList = this.props.idPlayList;
    const name = (props.client && props.client.name) || (props.server && props.server.name);
    return (state.show || null) && (
      <table className={styles.table}>
        <caption>{name}</caption>
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
                state.showDiff
                ? (
                  <Icon
                    button
                    type="transfer"
                    title="Show Difference w/server"
                    onClick={this.onShowDiffHandler}
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
    );
  }
}

PlayListItemCompareComponent.propTypes = {
  server: PropTypes.shape({
    name: PropTypes.string,
    idTracks: PropTypes.arrayOf(PropTypes.number),
    lastUpdated: PropTypes.string,
  }),
  client: PropTypes.shape({
    name: PropTypes.string,
    idTracks: PropTypes.arrayOf(PropTypes.number),
    lastUpdated: PropTypes.string,
  }),
  onActionChange: PropTypes.func,
  onShowDiff: PropTypes.func,
  idPlayList: PropTypes.string,
};

export const mapStateToProps = (state, props) =>
  syncSelectors.sideBySideItem(state, props.idPlayList);

export const mapDispatchToProps = (dispatch, { idPlayList }) => ({
  onActionChange: action => dispatch(setActionForSync(idPlayList, action)),
  onShowDiff: () => dispatch(push(`/sync/PlayListDiff/${idPlayList}`)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PlayListItemCompareComponent);
