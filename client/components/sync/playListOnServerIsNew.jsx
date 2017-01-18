import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import Icon from '_components/misc/icon';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import FoldingToolbar from '_components/misc/foldingToolbar';

import {
  importNewPlayList,
} from '_store/actions';

import styles from './playListsOnServerIsNew.css';


export function PLOnServerIsNewComponent({
  playList,
  onListImport,
}) {
  return (
    <ListGroupItem
      className={styles.listGroupItem}
      bsStyle="success"
    >
      <div className={styles.info}>
        <div className={styles.name}>{playList.serverName}</div>
        <div className={styles.status}>Playlist in server is new</div>
      </div>
      <FoldingToolbar>
        <Icon
          button
          type="import"
          onClick={onListImport}
          title="Import from server"
          label="Import"
        />
      </FoldingToolbar>
    </ListGroupItem>
  );
}

PLOnServerIsNewComponent.propTypes = {
  playList: PropTypes.object,
  onListImport: PropTypes.func,
};

export const mapStateToProps = state => state.sync;

export const mapDispatchToProps = (dispatch, { idDevice, playList }) => ({
  onListImport: () => dispatch(importNewPlayList(idDevice, playList)),
});


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PLOnServerIsNewComponent);
