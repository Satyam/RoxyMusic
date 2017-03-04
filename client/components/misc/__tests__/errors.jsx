import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

import { CLEAR_HTTP_ERRORS } from '_store/actions';

import { ErrorsComponent, mapStateToProps, mapDispatchToProps } from '../errors';

jest.mock('_store/selectors.js', () => ({
  requestSelectors: {
    errors: jest.fn(state => state),
  },
}));

describe('ErrorsComponent', () => {
  describe('snapshot testing', () => {
    it('with no properties', () => {
      const wrapper = shallow(<ErrorsComponent errors={[]} />);
      expect(toJson(wrapper)).toMatchSnapshot();
    });
    it('with errors property', () => {
      const wrapper = shallow(
        <ErrorsComponent
          errors={[
            { error: { message: 'whatever' } },
            { error: { message: 'another' } },
          ]}
        />);
      expect(toJson(wrapper)).toMatchSnapshot();
    });
  });
  describe('mapStateToProps', () => {
    it('should return an empty array', () => {
      const initialState = [];
      expect(mapStateToProps(initialState)).toEqual({ errors: [] });
    });
    it('should return an array of objects', () => {
      const initialState = [
        { error: { message: 'whatever' } },
        { error: { message: 'another' } },
      ];
      expect(mapStateToProps(initialState)).toEqual({ errors: initialState });
    });
  });
  describe('mapDispatchToProps', () => {
    it('should return an object with an onCloseErrors property', () => {
      const dispatch = jest.fn();
      expect(Object.keys(mapDispatchToProps(dispatch))).toEqual(['onCloseErrors']);
    });
    it('should dispatch a clearHttpErrors action', () => {
      const dispatch = jest.fn();
      mapDispatchToProps(dispatch).onCloseErrors();
      expect(dispatch.mock.calls).toEqual([
        [{ type: CLEAR_HTTP_ERRORS }],
      ]);
    });
  });
  describe('events', () => {
    it('should fire click event', () => {
      const onCloseErrors = jest.fn();
      const preventDefault = jest.fn();
      const wrapper = shallow(
        <ErrorsComponent
          errors={[]}
          onCloseErrors={onCloseErrors}
        />
      );
      wrapper.find('button').simulate('click', { preventDefault });
      expect(onCloseErrors.mock.calls).toEqual([
        [],
      ]);
      expect(preventDefault.mock.calls).toEqual([
        [],
      ]);
    });
    it('with shift key it should fail', () => {
      const onCloseErrors = jest.fn();
      const preventDefault = jest.fn();
      const wrapper = shallow(
        <ErrorsComponent
          errors={[]}
          onCloseErrors={onCloseErrors}
        />
      );
      wrapper.find('button').simulate('click', {
        preventDefault,
        shiftKey: true,
      });
      // Neither of them should be called
      expect(onCloseErrors.mock.calls).toEqual([]);
      expect(preventDefault.mock.calls).toEqual([]);
    });
  });
});
