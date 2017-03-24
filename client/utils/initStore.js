import { Component, PropTypes } from 'react';
import createHelper from 'recompose/createHelper';
import createEagerFactory from 'recompose/createEagerFactory';

const initStore = initializer => (BaseComponent) => {
  const init = Array.isArray(initializer) ? initializer[0] : initializer;
  const factory = createEagerFactory(BaseComponent);

  const StoreInitializer = class extends Component {
    constructor(props, context) {
      super(props, context);
      this.store = context.store;
    }
    componentWillMount() {
      const store = this.store;
      this.isInitialized(init(store.dispatch, store.getState, this.props));
    }
    componentDidMount() {
      this.mounted = true;
    }
    componentWillUnmount() {
      this.mounted = false;
    }

    componentWillReceiveProps(nextProps) {
      const store = this.store;
      this.isInitialized(init(store.dispatch, store.getState, nextProps, this.props));
    }

    static getStoreInitializer() {
      return initializer;
    }

    isInitialized(initRet) {
      this.shouldUpdate = initRet !== false;
      if (initRet.then) {
        if (typeof window !== 'undefined') {
          this.shouldUpdate = false;
          initRet.then(() => {
            this.shouldUpdate = true;
            if (this.mounted) this.forceUpdate();
          });
        }
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
