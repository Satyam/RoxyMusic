import React, { Component, PropTypes } from 'react';
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import bindHandlers from '_utils/bindHandlers';
import isPlainClick from '_utils/isPlainClick';
import Icon from './icon';

class FoldingToolbar extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
    bindHandlers(this);
  }
  onOpenHandler(ev) {
    if (isPlainClick(ev)) this.setState({ open: true });
    this.timer = setTimeout(() => this.close(), 10000);
  }
  onClickHandler(ev) {
    if (isPlainClick(ev)) {
      if (this.timer) clearTimeout(this.timer);
      this.close();
    }
  }
  close() {
    this.setState({ open: false });
    this.timer = null;
  }
  render() {
    return (
      this.state.open
      ? (<ButtonGroup
        style={{
          position: 'absolute',
          right: '1em',
        }}
        onClick={this.onClickHandler}
      >
        {this.props.children}
      </ButtonGroup>)
      : (<Button onClick={this.onOpenHandler}><Icon type="menu-hamburger" /></Button>)
    );
  }
}

FoldingToolbar.propTypes = {
  children: PropTypes.node,
};

export default FoldingToolbar;