import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import classnames from 'classnames';
import isPlainClick from '_utils/isPlainClick';
import styles from './icon.css';

function Icon({
  type,
  href,
  onClick,
  disabled,
  label,
  children,
  className,
  title,
  button,
  block,
  ...props
 }) {
  /* eslint-disable jsx-a11y/no-static-element-interactions */
  const actualOnClick = ev => !disabled && isPlainClick(ev) && onClick(ev);
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
  const lbl = (label || children) && (<span className={styles.label}>
    {`${label || ''} ${children || ''}`}
  </span>);
  let btnClassName = '';
  if (button) {
    if (button === true) {
      btnClassName = 'btn-default';
    } else if (typeof button === 'string') {
      btnClassName = `btn-${button}`;
    }
    btnClassName = classnames('btn', btnClassName, block && 'btn-block');
  }
  return (
    href
    ? (<Link
      className={classnames(className, styles.container, styles.pointer, btnClassName)}
      to={href}
      title={title}
      style={{ opacity: (disabled ? 0.3 : 1) }}
      {...props}
    >
      {span}
      {lbl}
    </Link>)
    : (<span
      onClick={actualOnClick}
      className={classnames(
        className,
        styles.container,
        actualOnClick && styles.pointer,
        btnClassName
      )}
      title={title}
      style={{ opacity: (disabled ? 0.3 : 1) }}
      {...props}
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
  button: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
  ]),
  block: PropTypes.bool,
  children: PropTypes.node,
};

export default Icon;
