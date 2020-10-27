import { state } from "./state";
import { SimpleScope } from "./simpleScope";

test('state should be bindable', () => {
  const scope = new SimpleScope();
  let myValue = 0;
  const myState = state(1);
  
  myState.bind(scope, v => myValue = v);
  expect(myValue).toBe(1);

  myState.setValue(2);
  expect(myValue).toBe(2);

  scope.unsubscribeAll();
  myState.setValue(3);
  expect(myValue).toBe(2);
});
