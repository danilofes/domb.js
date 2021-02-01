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

  it("provides fields", () => {
    interface MyObject {
      x: number;
    }

    const scope = new SimpleScope();
    let myValue = 0;
    const parentState = state<MyObject>({ x: 1 });
    const myState = parentState.$.x;

    myState.bind(scope, (v) => (myValue = v));
    expect(myValue).toBe(1);

    myState.setValue(2);
    expect(myValue).toBe(2);
  });

  it("provides array index", () => {
    const scope = new SimpleScope();
    let myValue = 0;
    const parentState = state<number[]>([0, 1]);
    const myState = parentState.$[1];

    myState.bind(scope, (v) => (myValue = v));
    expect(myValue).toBe(1);

    myState.setValue(2);
    expect(myValue).toBe(2);
  });

  it("provides fallback value", () => {
    interface MyObject {
      inner?: {
        x: number;
        y: number;
      };
    }

    const scope = new SimpleScope();
    let myValue = 0;
    const parentState = state<MyObject>({});
    const myState = parentState.$.inner.withFallbackValue({ x: 1, y: 1 }).$.x;

    myState.bind(scope, (v) => (myValue = v));
    expect(myValue).toBe(1);

    myState.setValue(2);
    expect(myValue).toBe(2);
    expect(parentState.getValue().inner?.y).toBe(1);
  });
});
