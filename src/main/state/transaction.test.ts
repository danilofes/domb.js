import { state, SimpleScope, inTransaction } from ".";

test("state should emit ValueChangeEvent at the end of transaction", () => {
  const state1 = state(4);
  const scope = new SimpleScope();
  let value1 = 0;
  state1.bind(scope, (value) => (value1 = value));

  inTransaction(() => {
    state1.value = 5;
    expect(state1.value).toBe(5);
    expect(value1).toBe(4);
  });
  expect(value1).toBe(5);
});

test("state should emit ValueChangeEvent once per transaction", () => {
  const state1 = state(4);
  const scope = new SimpleScope();
  const log: string[] = [];
  state1.subscribe(scope, ({ newValue, prevValue }) => log.push(`newValue=${newValue}; prevValue=${prevValue}`));

  inTransaction(() => {
    state1.value = 5;
    state1.value = 6;
    state1.value = 7;
  });
  expect(log).toEqual(["newValue=7; prevValue=4"]);
});

test("state should not emit ValueChangeEvent when value is restored inside transaction", () => {
  const state1 = state(4);
  const scope = new SimpleScope();
  const log: string[] = [];
  state1.subscribe(scope, ({ newValue, prevValue }) => log.push(`newValue=${newValue}; prevValue=${prevValue}`));

  inTransaction(() => {
    state1.value = 5;
    state1.value = 4;
  });
  expect(log).toEqual([]);
});
