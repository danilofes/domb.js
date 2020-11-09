import { state } from "./state";
import { SimpleScope } from "./simpleScope";
import { inTransaction } from "./transaction";

test('state should emit ValueChangeEvent at the end of transaction', () => {
  const state1 = state(4);
  const scope = new SimpleScope();
  let value1 = 0;
  state1.bind(scope, value => value1 = value);

  inTransaction(() => {
    state1.setValue(5);
    expect(state1.getValue()).toBe(5);
    expect(value1).toBe(4);
  });
  expect(value1).toBe(5);
});

test('state should emit ValueChangeEvent once per transaction', () => {
  const state1 = state(4);
  const scope = new SimpleScope();
  const log: string[] = [];
  state1.subscribe(scope, ({ newValue, prevValue }) => log.push(`newValue=${newValue}; prevValue=${prevValue}`));

  inTransaction(() => {
    state1.setValue(5);
    state1.setValue(6);
    state1.setValue(7);
  });
  expect(log).toEqual(['newValue=7; prevValue=4']);
});

test('state should not emit ValueChangeEvent when value is restored inside transaction', () => {
  const state1 = state(4);
  const scope = new SimpleScope();
  const log: string[] = [];
  state1.subscribe(scope, ({ newValue, prevValue }) => log.push(`newValue=${newValue}; prevValue=${prevValue}`));

  inTransaction(() => {
    state1.setValue(5);
    state1.setValue(4);
  });
  expect(log).toEqual([]);
});
