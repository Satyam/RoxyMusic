import React, { PropTypes } from 'react';
import { Link } from 'react-router';

function Icon({ type, href, onClick, disabled, children, className }) {
  /* eslint-disable jsx-a11y/no-static-element-interactions */
  const span = (
    <span
      className={`glyphicon glyphicon-${type}`}
      onClick={!disabled && onClick}
      style={{
        cursor: ((onClick && !disabled) ? 'pointer' : 'default'),
        color: (disabled ? 'silver' : '#333'),
      }}
    />
  );
  return (
    href
    ? (<Link className={className} to={href}>{span} {children}</Link>)
    : (<span className={className}>{span} {children}</span>)
  );
}

Icon.propTypes = {
  type: PropTypes.string.isRequired,
  href: PropTypes.string,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  children: PropTypes.node,
  className: PropTypes.string,
};

export default Icon;
