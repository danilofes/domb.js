import { state, map, SimpleScope } from ".";

test("should be possible to map state", () => {
  const myState = state({
    n: 4,
  });

  const mappedState = map(myState, (value) => value.n);

  expect(mappedState.value).toBe(4);

  const scope = new SimpleScope();
  let nValue = mappedState.value;
  mappedState.bind(scope, (n) => (nValue = n));
  expect(nValue).toBe(4);

  myState.value = {
    n: 5,
  };
  expect(nValue).toBe(5);

  scope.unsubscribeAll();
  myState.value = {
    n: 6,
  };
  expect(nValue).toBe(5);
});

test("should not fire when value is unchanged", () => {
  const myState = state({
    n: 4,
  });
  const mappedState = map(myState, (value) => value.n);
  const scope = new SimpleScope();
  const log: string[] = [];
  mappedState.bind(scope, (n) => log.push(`callback n=${n}`));

  myState.value = {
    n: 4,
  };

  expect(log).toEqual(["callback n=4"]);
});
