import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import classnames from 'classnames';

import styles from './icon.css';

function Icon({ type, href, onClick, disabled, label, className }) {
  /* eslint-disable jsx-a11y/no-static-element-interactions */
  const actualOnClick = !disabled && onClick;
  const span = (
    <span
      className={`glyphicon glyphicon-${type}`}
      style={{
        opacity: (disabled ? 0.3 : 1),
      }}
    />
  );
  const lbl = label && (<span className={styles.label}>{label}</span>);
  return (
    href
    ? (<Link
      className={classnames(className, styles.container, styles.pointer)}
      to={href}
    >
      {span}
      {lbl}
    </Link>)
    : (<span
      onClick={actualOnClick}
      className={classnames(className, styles.container, actualOnClick && styles.pointer)}
    >
      {span}
      {lbl}
    </span>)
  );
}

Icon.propTypes = {
  type: PropTypes.string.isRequired,
  href: PropTypes.string,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  label: PropTypes.string,
  className: PropTypes.string,
};

export default Icon;
