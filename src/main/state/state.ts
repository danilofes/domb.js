import { Callback, IScope, IState, IStateUpdater, IValueChangeEvent, Unsubscribe, IFieldAccessor, Updater } from "./events";
import { readAndNotify } from "./sourceCollector";
import { onCommitTransaction } from "./transaction";

export function state<T>(initialValue: T): State<T> {
  return new State(initialValue);
}

export abstract class BaseState<T> implements IState<T> {
  $: IFieldAccessor<T>;
  abstract value: T;

  constructor() {
    this.$ = createFieldAccessor(this);
  }

  abstract subscribe(scope: IScope, callback: Callback<IValueChangeEvent<T>>): Unsubscribe;

  bind(scope: IScope, callback: Callback<T>): Unsubscribe {
    callback(this.value);
    return this.subscribe(scope, ({ newValue }) => callback(newValue));
  }

  push(event: T): void {
    this.value = event;
  }

  withFallbackValue(value: NonNullable<T>): IState<NonNullable<T>> {
    return new NonNullableState(this, value);
  }

  atIndex(i: number): T extends ReadonlyArray<infer E> ? StateArrayIndex<E> : never {
    return new StateArrayIndex<any>((this as any), i) as any;
  }

  update(updateFn: Updater<T>) {
    this.value = updateFn(this.value);
  }
}

export class State<T> extends BaseState<T> {
  private readonly listeners: Set<Callback<IValueChangeEvent<T>>> = new Set();
  private pendingChange: IValueChangeEvent<T> | null = null;

  constructor(private _value: T) {
    super();
  }

  get value(): T {
    return readAndNotify(this, () => this._value);
  }

  subscribe(scope: IScope, callback: Callback<IValueChangeEvent<T>>): Unsubscribe {
    this.listeners.add(callback);
    return scope.addUnsubscribe(() => this.listeners.delete(callback));
  }

  set value(newValue: T) {
    const changeEvent = { newValue, prevValue: this._value };
    this._value = newValue;
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

  protected shouldSkipChangeEvent(ce: IValueChangeEvent<T>): boolean {
    return false;
  };

  get value(): U {
    return readAndNotify(this, () => this.getDerivedValue(this.state.value));
  }

  set value(newValue: U) {
    this.state.value = this.buildDerivedValue(this.state.value, newValue);
  }

  subscribe(scope: IScope, callback: Callback<IValueChangeEvent<U>>): Unsubscribe {
    return this.state.subscribe(scope, (ce) => {
      if (!this.shouldSkipChangeEvent(ce)) {
        const newValue = this.getDerivedValue(ce.newValue);
        const prevValue = this.getDerivedValue(ce.prevValue);
        if (newValue !== prevValue) {
          callback({ newValue, prevValue });
        }
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

  shouldSkipChangeEvent(ce: IValueChangeEvent<E[]>) {
    return this.index >= ce.prevValue.length || this.index >= ce.newValue.length;
  }
}

class NonNullableState<T> extends DerivedState<T, NonNullable<T>> {
  constructor(state: IState<T>, private fallbackValue: NonNullable<T>) {
    super(state);
  }

  getDerivedValue(v: T): NonNullable<T> {
    return (v ?? this.fallbackValue) as NonNullable<T>;
  }

  buildDerivedValue(prevT: T, newU: NonNullable<T>): T {
    return newU;
  }
}

function createFieldAccessor<T>(state: IState<T>): IFieldAccessor<T> {
  return new Proxy<any>({}, {
    get: (target, name) => {
      return new StateField<any, any>(state, name);
    },
  });
}
