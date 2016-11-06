import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import FoldingToolbar from '_utils/foldingToolbar';
// import Icon from '_utils/icon';
// import Button from 'react-bootstrap/lib/Button';
import styles from './playListItem.css';

export const PlayListItemComponent = ({ idPlayList, name, numTracks }) => (
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
      <FoldingToolbar>{/*
        <Button onClick={console.log.bind(console, 'play')}><Icon type="play" /></Button>
        <Button onClick={console.log.bind(console, 'up')}><Icon type="arrow-up" /></Button>
        <Button onClick={console.log.bind(console, 'otro')}>otro</Button>
      */ }</FoldingToolbar>
    </div>
  </ListGroupItem>
);


PlayListItemComponent.propTypes = {
  idPlayList: PropTypes.number.isRequired,
  name: PropTypes.string,
  numTracks: PropTypes.number,
};

export const mapStateToProps = (state, props) => state.playLists[props.idPlayList] || {};

export default connect(
  mapStateToProps
)(PlayListItemComponent);
