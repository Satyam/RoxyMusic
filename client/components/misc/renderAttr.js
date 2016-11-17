import { createElement } from 'react';

export default function (element, props) {
  return (element || null) && (typeof element === 'function' ? createElement(element, props) : element);
}
