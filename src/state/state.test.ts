import { state } from "./state";

test('state should be bindable', () => {
  let myValue = 0;
  const myState = state(1);
  
  myState.bind(v => myValue = v);
  expect(myValue).toBe(1);

  myState.setValue(2);
  expect(myValue).toBe(2);
});
