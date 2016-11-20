export const CHANGE_DIMENSIONS = 'dimensions/change dimensions';

export function changeDimensions(dimensions) {
  return {
    type: CHANGE_DIMENSIONS,
    dimensions,
  };
}

export default (
  state = {},
  action
) => {
  switch (action.type) {
    case CHANGE_DIMENSIONS:
      return action.dimensions;
    default:
      return state;
  }
};
