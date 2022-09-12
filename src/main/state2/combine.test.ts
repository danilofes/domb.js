import { state, SimpleScope, compute, map, textVal } from ".";

test('should be possible to combine two states', () => {
  const state1 = state(4);
  const state2 = state(3);

  const n1TimesN2 = compute(() => state1.value * state2.value);
  expect(n1TimesN2.value).toBe(12);

  const scope = new SimpleScope();
  let result = 0;
  n1TimesN2.bind(scope, value => result = value);
  expect(result).toBe(12);

  state1.value = 2;
  expect(result).toBe(6);

  state2.value = 4;
  expect(result).toBe(8);

  scope.unsubscribeAll();
  state2.value = 5;
  expect(result).toBe(8);
});

test('should not fire when value is unchanged', () => {
  const rectangleState = state({ w: 3, h: 4 });
  const wState = map(rectangleState, rect => rect.w);
  const hState = map(rectangleState, rect => rect.h);
  const areaState = compute(() => wState.value * hState.value);

  const scope = new SimpleScope();
  const log: string[] = [];
  areaState.bind(scope, n => log.push(`callback n=${n}`));

  rectangleState.value = { w: 4, h: 3 }; // 12 should not fire
  rectangleState.value = { w: 1, h: 6 }; // 6
  rectangleState.value = { w: 2, h: 3 }; // 6 should not fire
  rectangleState.value = { w: 4, h: 3 }; // 12

  expect(log).toEqual([
    'callback n=12',
    'callback n=6',
    'callback n=12'
  ]);
});

test('should be possible to combine state with template string', () => {
  const aState = state(1);
  const bState = state('foo');
  const msg = textVal`a = ${aState}, b = ${bState}`;

  expect(msg.value).toBe('a = 1, b = foo');

  const scope = new SimpleScope();
  const log: string[] = [];
  msg.bind(scope, m => log.push(m));

  bState.value = 'bar';
  aState.value = 2;

  expect(log).toEqual([
    'a = 1, b = foo',
    'a = 1, b = bar',
    'a = 2, b = bar'
  ]);
});


test('should not alter behavior', () => {
  const aState = state(1);
  const aStateStr = textVal`${aState}`;
  const logA: number[] = [];
  const logAStr: string[] = [];
  const scope = new SimpleScope();
  aState.bind(scope, a => logA.push(a));
  aStateStr.bind(scope, aStr => logAStr.push(aStr));

  aState.value = 2;
  aState.value = 3;
  aState.value = 1;
  aState.value = 3;

  expect(logA).toEqual([1, 2, 3, 1, 3]);
  expect(logAStr).toEqual(["1", "2", "3", "1", "3"]);
});