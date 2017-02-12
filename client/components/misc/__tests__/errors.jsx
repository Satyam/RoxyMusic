import React from 'react';
import ReactDOM from 'react-dom';
import { shallow } from 'enzyme';

import { ErrorsComponent } from '../errors';

describe('ErrorsComponent', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<ErrorsComponent errors={[]} />, div);
  });
  it('enzyme shallow', () => {
    const err = shallow(<ErrorsComponent errors={[]} />);
    console.log(err.text());
  });
});
