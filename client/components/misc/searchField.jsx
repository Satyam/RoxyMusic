import React, { PropTypes } from 'react';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import Icon from '_components/misc/icon';

const SearchField = ({ search, onChangeHandler, onClearHandler }) => (
  <FormGroup>
    <InputGroup>
      <InputGroup.Addon><Icon type="search" /></InputGroup.Addon>
      <FormControl
        type="text"
        value={search || ''}
        placeholder="Search"
        onChange={onChangeHandler}
      />
      <InputGroup.Addon>
        <Icon
          type="remove-circle"
          disabled={!search.length}
          onClick={onClearHandler}
        />
      </InputGroup.Addon>
    </InputGroup>
  </FormGroup>
);

SearchField.propTypes = {
  search: PropTypes.string,
  onChangeHandler: PropTypes.func,
  onClearHandler: PropTypes.func,
};

export default SearchField;
