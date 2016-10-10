import React, { PropTypes } from 'react';
import { Link, withRouter, routerShape } from 'react-router';
import map from 'lodash/map';
import styles from './menu.css';

export const MenuComponent = ({ router, menuItems }) => (
  <ul className={styles.tabs}>
    {
      map(
        menuItems,
        (caption, path) => {
          if (typeof caption === 'object') {
            caption = (
              <span>
                <span className={`glyphicon glyphicon-${caption.icon}`} />
                {caption.caption}
              </span>
            );
          }
          return (
            router.isActive(path)
            ? (
              <li key={path} className={styles.active}>
                <a>{caption}</a>
              </li>
            )
            : (<li key={path}><Link to={path}>{caption}</Link></li>)
          );
        }
      )
    }
  </ul>
);

MenuComponent.propTypes = {
  router: routerShape,
  menuItems: PropTypes.objectOf(PropTypes.string),
};

export default withRouter(MenuComponent);
