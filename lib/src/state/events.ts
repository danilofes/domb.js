
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
  update(updater: Updater<T>): void;
}
