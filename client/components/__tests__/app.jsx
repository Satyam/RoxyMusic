import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

import { AppComponent, mapStateToProps } from '../app';

jest.mock('_store/selectors.js', () => ({
  configSelectors: {
    get: jest.fn((state, name) => state.config[name]),
  },
}));

describe('AppComponent', () => {
  describe('snapshot testing', () => {
    it('with no properties', () => {
      const wrapper = shallow(<AppComponent />);
      expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('with wide=true', () => {
      const wrapper = shallow(<AppComponent wide />);
      expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('with children', () => {
      const wrapper = shallow(
        <AppComponent>
          <h1>whatever</h1>
        </AppComponent>
      );
      expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('with children and wide=true', () => {
      const wrapper = shallow(
        <AppComponent wide>
          <h1>whatever</h1>
        </AppComponent>
      );
      expect(toJson(wrapper)).toMatchSnapshot();
    });
  });
  describe('mapStateToProps', () => {
    it('should return value from config object cache', () => {
      const initialState = {
        config: {
          wide: true,
        },
      };
      expect(mapStateToProps(initialState, 'wide')).toEqual({ wide: true });
    });
  });
});
