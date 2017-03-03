export default function (reducer, selectors, methods, initialState) {
  return () => {
    beforeAll(() => {
      const state = reducer(undefined, {});
      if (initialState) {
        expect(state).toEqual(initialState);
      }
    });
    it('should return an object', () => {
      expect(selectors).toMatchObject({});
    });
    it('should have enough methods, but no more, no less', () => {
      expect(Object.keys(selectors).length).toBe(methods.length);
    });
    methods.forEach((method) => {
      it(`${method} should be a function`, () => {
        expect(typeof selectors[method]).toBe('function');
      });
      it(`${method} should receive at least one argument (state)`, () => {
        expect(selectors[method].length).toBeGreaterThanOrEqual(1);
      });
    });
  };
}
