import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import pick from 'lodash/pick';

import Navbar from 'react-bootstrap/lib/Navbar';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import HelpBlock from 'react-bootstrap/lib/HelpBlock';
import Button from 'react-bootstrap/lib/Button';
import Icon from '_components/misc/icon';

import { setConfig } from '_store/actions';
import isPlainClick from '_utils/isPlainClick';
import bindHandlers from '_utils/bindHandlers';


const relevantProps = ['wide', 'remoteHost', 'musicDir'];

export class ConfigComponent extends Component {
  constructor(props) {
    super(props);
    this.state = pick(props, relevantProps);
    bindHandlers(this);
  }
  onRemoteHostChangeHandler(ev) {
    this.setState({ remoteHost: ev.target.value });
  }
  onMusicDirChangeHandler(ev) {
    this.setState({ musicDir: ev.target.value });
  }
  onWideHandler(ev) {
    this.setState({ wide: ev.target.checked });
  }
  onOpenFolderHandler(ev) {

  }
  onSubmitHandler(ev) {
    if (isPlainClick(ev)) {
      this.props.onSubmit(this.state, pick(this.props, relevantProps));
    }
  }
  render() {
    return (<div>
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>
            <Icon type="arrow-up" href="/" label="  " />
            Configuration
          </Navbar.Brand>
        </Navbar.Header>
      </Navbar>

      <FormGroup
        controlId="remoteHost"
        validationState={null}
      >
        <ControlLabel>URL for main host</ControlLabel>
        <FormControl
          type="text"
          value={this.state.remoteHost}
          placeholder="Enter URL"
          onChange={this.onRemoteHostChangeHandler}
        />
        <FormControl.Feedback />
        <HelpBlock>Nombre ya existe.</HelpBlock>
      </FormGroup>
      <FormGroup
        controlId="musicDir"
        validationState={null}
      >
        <ControlLabel>Music directory</ControlLabel>
        <InputGroup>
          <FormControl
            type="text"
            value={this.state.musicDir}
            placeholder="Enter path to music dir"
            onChange={this.onMusicDirChangeHandler}
          />
          <InputGroup.Addon>
            <Icon
              type="folder-open"
              onClick={this.onOpenFolderHandler}
              label="Browse"
            />
          </InputGroup.Addon>
        </InputGroup>
        <FormControl.Feedback />
        <HelpBlock>Nombre ya existe.</HelpBlock>
      </FormGroup>
      <Checkbox
        checked={this.state.wide}
        onChange={this.onWideHandler}
      >
        Wide Screen
      </Checkbox>
      <Button onClick={this.onSubmitHandler}>Submit</Button>
    </div>);
  }
}

ConfigComponent.propTypes = {
  wide: PropTypes.bool,
  musicDir: PropTypes.string,
  remoteHost: PropTypes.string,
  onSubmit: PropTypes.func,
};

export const mapStateToProps = state => state.config || {};

export const mapDispatchToProps = dispatch => ({
  onSubmit: (newValues, oldValues) =>
    Promise.all(relevantProps.map(prop =>
      newValues[prop] !== oldValues[prop] && dispatch(setConfig(prop, newValues[prop]))
    )),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConfigComponent);
