import { state, SimpleScope, combine, map, textVal } from ".";

test('should be possible to combine two states', () => {
  const state1 = state(4);
  const state2 = state(3);

  const n1TimesN2 = combine([state1, state2], ([n1, n2]) => n1 * n2);
  expect(n1TimesN2.getValue()).toBe(12);

  const scope = new SimpleScope();
  let result = 0;
  n1TimesN2.bind(scope, value => result = value);
  expect(result).toBe(12);

  state1.setValue(2);
  expect(result).toBe(6);

  state2.setValue(4);
  expect(result).toBe(8);

  scope.unsubscribeAll();
  state2.setValue(5);
  expect(result).toBe(8);
});

test('should not fire when value is unchanged', () => {
  const rectangleState = state({ w: 3, h: 4 });
  const wState = map(rectangleState, rect => rect.w);
  const hState = map(rectangleState, rect => rect.h);
  const areaState = combine([wState, hState], ([w, h]) => w * h);

  const scope = new SimpleScope();
  const log: string[] = [];
  areaState.bind(scope, n => log.push(`callback n=${n}`));

  rectangleState.setValue({ w: 4, h: 3 });

  expect(log).toEqual([
    'callback n=12'
  ]);
});

test('should be possible to combine state with template string', () => {
  const aState = state(1);
  const bState = state('foo');
  const msg = textVal`a = ${aState}, b = ${bState}`;

  expect(msg.getValue()).toBe('a = 1, b = foo');

  const scope = new SimpleScope();
  const log: string[] = [];
  msg.bind(scope, m => log.push(m));

  bState.setValue('bar');
  aState.setValue(2);

  expect(log).toEqual([
    'a = 1, b = foo',
    'a = 1, b = bar',
    'a = 2, b = bar'
  ]);
});
