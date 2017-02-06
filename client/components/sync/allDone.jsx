import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';

import Icon from '_components/misc/icon';

import {
  push,
} from '_store/actions';

import styles from './index.css';

export function AllDoneComponent({
  onDone,
}) {
  return (
    <ListGroup>
      <ListGroupItem>
        <div className={styles.heading}>
          All Done!
        </div>
      </ListGroupItem>
      <ListGroupItem>
        <Icon
          button
          block
          type="ok"
          onClick={onDone}
          label="Done"
        />
      </ListGroupItem>
    </ListGroup>
  );
}

AllDoneComponent.propTypes = {
  onDone: PropTypes.func,
};

export const mapDispatchToProps = dispatch => ({
  onDone: () => dispatch(push('/')),
});

export default connect(
  null,
  mapDispatchToProps
)(AllDoneComponent);
