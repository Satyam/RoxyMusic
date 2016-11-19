import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import classnames from 'classnames';

import styles from './icon.css';

function Icon({ type, href, onClick, disabled, label, className, title }) {
  /* eslint-disable jsx-a11y/no-static-element-interactions */
  const actualOnClick = !disabled && onClick;
  const span = (
    <span className={styles.icons}>{
      type.split(',').map(t => (
        <span
          key={t}
          className={`glyphicon glyphicon-${t}`}
        />
      ))
    }</span>
  );
  const lbl = label && (<span className={styles.label}>{label}</span>);
  return (
    href
    ? (<Link
      className={classnames(className, styles.container, styles.pointer)}
      to={href}
      title={title}
      style={{ opacity: (disabled ? 0.3 : 1) }}
    >
      {span}
      {lbl}
    </Link>)
    : (<span
      onClick={actualOnClick}
      className={classnames(className, styles.container, actualOnClick && styles.pointer)}
      title={title}
      style={{ opacity: (disabled ? 0.3 : 1) }}
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
  title: PropTypes.string,
};

export default Icon;
