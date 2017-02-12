import React, { PropTypes } from 'react';
import { shallow, mount } from 'enzyme';

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import App, { AppComponent } from '../app';

function createStore(middlewares, initialState) {
  return configureMockStore(middlewares)(initialState);
}

const initialState = {
  requests: { pending: 0, errors: [] },
  config: {},
  playLists: {
    status: 0,
    hash: {},
  },
};

describe('AppComponent', () => {
  // describe('with .html()', () => {
  //   it('without store in context', () => {
  //     const app = shallow(<AppComponent />);
  //     console.log(app.html());
  //   });
  //   it('with store', () => {
  //     const app = shallow(
  //       <AppComponent />,
  //       { context: { store: createStore([thunk], initialState) } }
  //     );
  //     console.log(app.html());
  //   });
  //   it('with store and enclosed JSX', () => {
  //     const app = shallow(
  //       (<AppComponent />),
  //       { context: { store: createStore([thunk], initialState) } }
  //     );
  //     console.log(app.html());
  //   });
  // });
  describe('with .text()', () => {
    it('without store in context', () => {
      const app = shallow(<AppComponent />);
      console.log(app.text());
    });
    it('with store', () => {
      const app = shallow(
        <AppComponent />,
        { context: { store: createStore([thunk], initialState) } }
      );
      console.log(app.text());
    });
    it('with store and enclosed JSX', () => {
      const app = shallow(
        (<AppComponent />),
        { context: { store: createStore([thunk], initialState) } }
      );
      console.log(app.text());
    });
    describe('connected with .text()', () => {
      // it('without store in context', () => {
      //   const app = shallow(<App />);
      //   console.log(app.text());
      // });
      // it('with store', () => {
      //   const app = shallow(
      //     <App />,
      //     { context: { store: createStore([thunk], initialState) } }
      //   );
      //   console.log(app.text());
      // });
      // it('with store and enclosed JSX', () => {
      //   const app = shallow(
      //     (<App />),
      //     { context: { store: createStore([thunk], initialState) } }
      //   );
      //   console.log(app.text());
      // });
    });
    describe('find', () => {
      // it('find Icon', () => {
      //   const app = shallow(<AppComponent />);
      //   const icon = app.find('Icon');
      //   console.log(icon.text());
      // });
      it('find Connect(LoadingComponent)', () => {
        const app = shallow(<AppComponent />);
        const loading = app.find('Connect(LoadingComponent)');
        console.log('found', loading.text());
      });
      // it('find LoadingComponent', () => {
      //   const app = shallow(<AppComponent />);
      //   const loading = app.find('LoadingComponent');
      //   console.log('found', loading.text());
      // });
    });
  });


  // it('deep un-connected AppComponent', () => {
  //   const app = mount(o
  //     (<AppComponent />),
  //     // {
  //     //   context: { store: createStore([thunk], initialState) },
  //     //   childContextTypes: { store: PropTypes.object },
  //     // }
  //   );
  //   console.log(app.text());
  // });
  //
  // it('connected App', () => {
  //   const app = shallow(
  //     (<App />),
  //     // { context: { store: createStore([thunk], initialState) } }
  //   );
  //   console.log(app.text());
  // });
});
