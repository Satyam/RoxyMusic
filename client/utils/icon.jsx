import React, { PropTypes } from 'react';

const Icon = ({ type, onClick }) => (
  /* eslint-disable jsx-a11y/no-static-element-interactions */
  <span
    className={`glyphicon glyphicon-${type}`}
    onClick={onClick}
    style={{ cursor: (onClick ? 'pointer' : 'default') }}
  />
);

Icon.propTypes = {
  type: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

export default Icon;
