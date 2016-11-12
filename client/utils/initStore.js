import { Component, PropTypes } from 'react';
import createHelper from 'recompose/createHelper';
import createEagerFactory from 'recompose/createEagerFactory';

const initStore = initializer => (BaseComponent) => {
  const factory = createEagerFactory(BaseComponent);

  const StoreInitializer = class extends Component {
    constructor(props, context) {
      super(props, context);
      this.store = context.store;
    }
    componentWillMount() {
      const store = this.store;
      this.isInitialized(initializer(store.dispatch, store.getState(), this.props));
    }

    componentWillReceiveProps(nextProps) {
      const store = this.store;
      this.isInitialized(initializer(store.dispatch, store.getState(), nextProps, this.props));
    }

    isInitialized(initRet) {
      this.shouldUpdate = initRet !== false;
      if (initRet instanceof Promise) {
        this.shouldUpdate = false;
        initRet.then(() => {
          this.shouldUpdate = true;
          this.forceUpdate();
        });
      }
    }
    shouldComponentUpdate() {
      return this.shouldUpdate;
    }

    render() {
      return factory(this.props);
    }
  };
  StoreInitializer.contextTypes = {
    store: PropTypes.shape({
      subscribe: PropTypes.func.isRequired,
      dispatch: PropTypes.func.isRequired,
      getState: PropTypes.func.isRequired,
    }),
  };
  return StoreInitializer;
};


export default createHelper(initStore, 'initStore');
