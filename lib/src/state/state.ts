import { Callback, IScope, IState, IValueChangeEvent, Unsubscribe, Updater } from "./events";
import { onCommitTransaction } from "./transaction";

export function state<T>(initialValue: T): State<T> {
  return new State(initialValue);
}

type StateFields<T> = T extends object
  ? {
      [K in keyof T & string]: StateField<T, K>;
    }
  : {};

abstract class BaseState<T> implements IState<T> {
  $: StateFields<T>;

  constructor() {
    this.$ = new Proxy<any>(
      {},
      {
        get: (target, name) => new StateField<any, any>(this, name),
      }
    );
  }

  abstract getValue(): T;
  abstract setValue(newValue: T): void;
  abstract subscribe(scope: IScope, callback: Callback<IValueChangeEvent<T>>): Unsubscribe;

  update(updater: Updater<T>): void {
    this.setValue(updater(this.getValue()));
  }

  bind(scope: IScope, callback: Callback<T>): Unsubscribe {
    callback(this.getValue());
    return this.subscribe(scope, ({ newValue }) => callback(newValue));
  }

  push(event: T): void {
    this.setValue(event);
  }

  withFallbackValue(value: NonNullable<T>): NonNullableState<T> {
    return new NonNullableState(this, value);
  }

  atIndex<E>(index: number): T extends (infer E)[] ? StateArrayIndex<E> : never {
    return new StateArrayIndex<E>(this as any, index) as any;
  }
}

export class State<T> extends BaseState<T> {
  private readonly listeners: Set<Callback<IValueChangeEvent<T>>> = new Set();
  private pendingChange: IValueChangeEvent<T> | null = null;

  constructor(private value: T) {
    super();
  }

  getValue(): T {
    return this.value;
  }

  subscribe(scope: IScope, callback: Callback<IValueChangeEvent<T>>): Unsubscribe {
    this.listeners.add(callback);
    return scope.addUnsubscribe(() => this.listeners.delete(callback));
  }

  setValue(newValue: T) {
    const changeEvent = { newValue, prevValue: this.value };
    this.value = newValue;
    this.emitValueChangeEventAtEndOfTransaction(changeEvent);
  }

  emitValueChangeEventAtEndOfTransaction(valueChangeEvent: IValueChangeEvent<T>) {
    if (this.pendingChange) {
      this.pendingChange.newValue = valueChangeEvent.newValue;
    } else {
      this.pendingChange = valueChangeEvent;
      onCommitTransaction(() => {
        if (this.pendingChange && this.pendingChange.newValue !== this.pendingChange.prevValue) {
          const changeToNotify = this.pendingChange;
          this.pendingChange = null;
          this.listeners.forEach((callback) => callback(changeToNotify));
        }
      });
    }
  }
}

abstract class DerivedState<T, U> extends BaseState<U> {
  constructor(protected state: IState<T>) {
    super();
  }

  abstract getDerivedValue(v: T): U;

  abstract buildDerivedValue(prevT: T, newU: U): T;

  getValue(): U {
    return this.getDerivedValue(this.state.getValue());
  }

  setValue(newValue: U): void {
    this.state.setValue(this.buildDerivedValue(this.state.getValue(), newValue));
  }

  subscribe(scope: IScope, callback: Callback<IValueChangeEvent<U>>): Unsubscribe {
    return this.state.subscribe(scope, (ce) => {
      const newValue = this.getDerivedValue(ce.newValue);
      const prevValue = this.getDerivedValue(ce.prevValue);
      if (newValue !== prevValue) {
        callback({ newValue, prevValue });
      }
    });
  }
}

class StateField<T extends object, K extends string & keyof T> extends DerivedState<T, T[K]> {
  constructor(state: IState<T>, private field: K) {
    super(state);
  }

  getDerivedValue(v: T): T[K] {
    return v[this.field];
  }

  buildDerivedValue(prevT: T, newU: T[K]): T {
    return { ...prevT, [this.field]: newU };
  }
}

class StateArrayIndex<E> extends DerivedState<E[], E> {
  constructor(state: IState<E[]>, private index: number) {
    super(state);
  }

  getDerivedValue(v: E[]): E {
    if (this.index >= v.length) {
      throw new Error(`cannot get index ${this.index} of array of length ${v.length}`);
    }
    return v[this.index];
  }

  buildDerivedValue(prevT: E[], newU: E): E[] {
    if (this.index >= prevT.length) {
      throw new Error(`cannot set index ${this.index} of array of length ${prevT.length}`);
    }
    return [...prevT.slice(0, this.index), newU, ...prevT.slice(this.index + 1)];
  }
}

class NonNullableState<T> extends DerivedState<T, NonNullable<T>> {
  constructor(state: IState<T>, private fallbackValue: NonNullable<T>) {
    super(state);
  }

  getDerivedValue(v: T): NonNullable<T> {
    return v ?? this.fallbackValue;
  }

  buildDerivedValue(prevT: T, newU: NonNullable<T>): T {
    return newU;
  }
}
