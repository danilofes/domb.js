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
    const myState = parentState.atIndex(1);

    myState.bind(scope, (v) => (myValue = v));
    expect(myValue).toBe(1);

    myState.setValue(2);
    expect(myValue).toBe(2);
  });

  it("array index should not crash when cease to exist", () => {
    const scope = new SimpleScope();
    
    const arrayState = state<number[]>([]);
    const index1State = arrayState.atIndex(1);
    const log: string[] = [];
    index1State.subscribe(scope, (e) => log.push(`changed from ${e.prevValue} to ${e.newValue}`));

    expect(() => index1State.getValue()).toThrow();

    arrayState.updater.append(7);
    arrayState.updater.append(8);
    expect(log).toEqual([]);

    index1State.setValue(9);
    expect(log).toEqual(["changed from 8 to 9"]);

    arrayState.updater.removeAt(1);
    expect(log).toEqual(["changed from 8 to 9"]);
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
