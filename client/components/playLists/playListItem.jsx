import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import Button from 'react-bootstrap/lib/Button';
import FoldingToolbar from '_components/misc/foldingToolbar';
import Icon from '_components/misc/icon';

import isPlainClick from '_utils/isPlainClick';
import {
  deletePlayList,
} from '_store/actions';

import styles from './playListItem.css';

export const PlayListItemComponent = ({ idPlayList, name, numTracks, onDeleteClick }) => (
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
    <div className={styles.right}>
      <FoldingToolbar>
        <Button onClick={onDeleteClick} >
          <Icon type="trash" title="delete" />
        </Button>
      </FoldingToolbar>
    </div>
  </ListGroupItem>
);


PlayListItemComponent.propTypes = {
  idPlayList: PropTypes.number.isRequired,
  name: PropTypes.string,
  numTracks: PropTypes.number,
  onDeleteClick: PropTypes.func,
};

export const mapStateToProps = (state, props) => state.playLists.hash[props.idPlayList] || {};

export const mapDispatchToProps = (dispatch, props) => ({
  onDeleteClick: ev => isPlainClick(ev) && dispatch(deletePlayList(props.idPlayList)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PlayListItemComponent);
