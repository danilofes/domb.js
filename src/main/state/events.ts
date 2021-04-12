
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

export interface IEventSource<T> {
  subscribe(scope: IScope, callback: Callback<T>): Unsubscribe;
}

export interface IValueSource<T> extends IEventSource<IValueChangeEvent<T>> {
  getValue(): T;
  bind(scope: IScope, callback: Callback<T>): Unsubscribe;
}

export type ValueLike<T> = IValueSource<T> | T;

export type UnwrapedValue<T> = T extends IValueSource<infer U> ? U : T;

export interface IState<T> extends IValueSource<T> {
  setValue(newValue: T): void;
  update(updateFn: Updater<T>): void;

  $: IFieldAccessor<T>;
  atIndex(i: number): T extends ReadonlyArray<infer E> ? IState<E> : never;
  bind(scope: IScope, callback: Callback<T>): Unsubscribe;
  withFallbackValue(value: NonNullable<T>): IState<NonNullable<T>>;
}

export type IFieldAccessor<T> =
  T extends object ? {
    [K in keyof T & string]: IState<T[K]>;
  }
  : {};

export type IStateUpdater<T> =
  T extends ReadonlyArray<infer E> ? {
    append(element: E): void;
    removeAt(index: number): void;
    replaceAt(index: number, element: E): void;
  }
  : T extends object ? {
    patch(fields: Partial<T>): void;
  }
  : {};

export function isValueSource<T = unknown>(v: IValueSource<T> | unknown): v is IValueSource<T> {
  return typeof v === 'object' && v !== null && 'getValue' in v;
}
