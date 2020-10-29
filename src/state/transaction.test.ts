import { state } from "./state";
import { SimpleScope } from "./simpleScope";
import { withTransaction } from "./transaction";

test('state should notify listeners at the end of transaction', () => {
  const state1 = state(4);
  const scope = new SimpleScope();
  let value1 = 0;
  state1.bind(scope, value => value1 = value);

  withTransaction(() => {
    state1.setValue(5);
    expect(state1.getValue()).toBe(5);
    expect(value1).toBe(4);
  });
  expect(value1).toBe(5);

});

test('state should notify once per transaction', () => {
  const state1 = state(4);
  const scope = new SimpleScope();
  const log: string[] = [];
  state1.subscribe(scope, ({ newValue, prevValue }) => log.push(`newValue=${newValue}; prevValue=${prevValue}`));

  withTransaction(() => {
    state1.setValue(5);
    state1.setValue(6);
    state1.setValue(7);
  });
  expect(log).toEqual(['newValue=7; prevValue=4']);
});

