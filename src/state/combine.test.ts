import { state } from "./state";
import { SimpleScope } from "./simpleScope";
import { combine } from "./combinedValue";

describe('combine', () => {

  it('should combine two states', () => {
    const state1 = state(4);
    const state2 = state(3);

    const n1TimesN2 = combine([state1, state2], (n1, n2) => n1 * n2);
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

});

