import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import isPlainClick from '_utils/isPlainClick';
import classNames from 'classnames';

import { clearHttpErrors } from '_store/actions';
import { requestSelectors } from '_store/selectors';

import styles from './errors.css';

export const ErrorsComponent = ({ errors, onCloseErrors }) => {
  const closeErrorsHandler = ev => isPlainClick(ev) && onCloseErrors();
  return (
    <div
      className={classNames(
        'errors',
        styles.errorsList,
        { hide: !errors.length }
      )}
    >
      <button onClick={closeErrorsHandler} className={styles.closeButton} />
      {
        errors.map(
          process.env.NODE_ENV === 'production'
          ? e => e.error.message
          : e => JSON.stringify(e, null, 2)
        ).join('\n')
      }
    </div>
  );
};

ErrorsComponent.propTypes = {
  errors: PropTypes.array,
  onCloseErrors: PropTypes.func,
};

export const mapStateToProps = state => ({
  errors: requestSelectors.errors(state),
});

export const mapDispatchToProps = dispatch => ({
  onCloseErrors: () => dispatch(clearHttpErrors()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ErrorsComponent);
