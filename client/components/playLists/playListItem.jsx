import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import FoldingToolbar from '_components/misc/foldingToolbar';
import Icon from '_components/misc/icon';

import isPlainClick from '_utils/isPlainClick';
import {
  deletePlayList,
  savePlayList,
} from '_store/actions';

import styles from './playListItem.css';

export const PlayListItemComponent = ({
  idPlayList,
  name,
  numTracks,
  onDeleteClick,
  onSaveClick,
}) => (
  <ListGroupItem className={styles.li}>
    <div className={styles.left}>
      <div className={styles.name}>
        <Link to={`/playLists/${idPlayList}`}>
          {name}
        </Link>
      </div>
      <div className={styles.tracks}>
        {numTracks}
      </div>
    </div>
    <FoldingToolbar>
      <Icon button type="trash" onClick={onDeleteClick} title="delete" />
      <Icon button type="save" onClick={onSaveClick} title="save" />
    </FoldingToolbar>
  </ListGroupItem>
);


PlayListItemComponent.propTypes = {
  idPlayList: PropTypes.string.isRequired,
  name: PropTypes.string,
  numTracks: PropTypes.number,
  onDeleteClick: PropTypes.func,
  onSaveClick: PropTypes.func,
};

export const mapStateToProps = (state, props) => state.playLists.hash[props.idPlayList] || {};

export const mapDispatchToProps = (dispatch, { idPlayList }) => ({
  onDeleteClick: ev => isPlainClick(ev) && dispatch(deletePlayList(idPlayList)),
  onSaveClick: ev => isPlainClick(ev) && dispatch(savePlayList(idPlayList)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PlayListItemComponent);
