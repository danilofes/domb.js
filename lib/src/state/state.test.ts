import { state, SimpleScope } from ".";

describe("state", () => {
  it("should hold a value", () => {
    const myState = state(1);
    expect(myState.getValue()).toBe(1);

    myState.setValue(2);
    expect(myState.getValue()).toBe(2);
  });

  it("should be bindable", () => {
    const scope = new SimpleScope();
    let myValue = 0;
    const myState = state(1);

    myState.bind(scope, (v) => (myValue = v));
    expect(myValue).toBe(1);

    myState.setValue(2);
    expect(myValue).toBe(2);
  });

  it("should stop emmiting events when scope finishes", () => {
    const scope = new SimpleScope();
    let myValue = 0;
    const myState = state(1);

    myState.bind(scope, (v) => (myValue = v));
    expect(myValue).toBe(1);

    scope.unsubscribeAll();
    myState.setValue(2);
    expect(myValue).toBe(1);
  });
});
