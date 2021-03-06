import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import FoldingToolbar from '_components/misc/foldingToolbar';
import Icon from '_components/misc/icon';

import {
  deletePlayList,
  savePlayList,
} from '_store/actions';

import { playListSelectors } from '_store/selectors';

import styles from './styles.css';

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

export const mapStateToProps =
  (state, props) => playListSelectors.item(state, props.idPlayList);

export const mapDispatchToProps = (dispatch, { idPlayList }) => ({
  onDeleteClick: () => dispatch(deletePlayList(idPlayList)),
  onSaveClick: () => dispatch(savePlayList(idPlayList)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PlayListItemComponent);
