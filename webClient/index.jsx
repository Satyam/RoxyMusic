import client from '_client';

const initialStateEl = document.getElementById('initialState');
let initialState = {};
if (initialStateEl) {
  initialState = JSON.parse(initialStateEl.innerHTML);
}
client(initialState);
