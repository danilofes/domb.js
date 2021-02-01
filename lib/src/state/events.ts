
export type Callback<T> = (value: T) => void;
export type Unsubscribe = () => void;
export type Updater<T> = (prevValue: T) => T;

export interface IValueChangeEvent<T> {
  newValue: T;
  prevValue: T;
}

export interface IScope {
  addUnsubscribe(unsubscribe: Unsubscribe): Unsubscribe;
  unsubscribeAll(): void;
}

export interface IEventEmmiter<T> {
  subscribe(scope: IScope, callback: Callback<T>): Unsubscribe;
}

export interface IEventReceiver<T> {
  push(event: T): void;
}

export interface IValueSource<T> extends IEventEmmiter<IValueChangeEvent<T>> {
  getValue(): T;
  bind(scope: IScope, callback: Callback<T>): Unsubscribe;
}

export interface IState<T> extends IValueSource<T>, IEventReceiver<T> {
  setValue(newValue: T): void;

  $: IStateAccessor<T>;
  bind(scope: IScope, callback: Callback<T>): Unsubscribe;
  push(event: T): void;
  withFallbackValue(value: NonNullable<T>): IState<NonNullable<T>>;
}

export type IStateAccessor<T> =
  T extends ReadonlyArray<infer E> ? {
    length: IState<number>;
    [index: number]: IState<E>;
  }
  : T extends object ? {
    [K in keyof T & string]: IState<T[K]>;
  }
  : {};

export type IStateUpdater<T> =
  T extends ReadonlyArray<infer E> ? {
    append(element: E): void;
    removeAt(index: number): void;
  }
  : T extends object ? {
    patch(fields: Partial<T>): void;
  }
  : {};

export function isValueSource<T = unknown>(v: IValueSource<T> | unknown): v is IValueSource<T> {
  return typeof v === 'object' && v !== null && 'getValue' in v;
}
