import { Callback, IScope, IState, Unsubscribe, Updater } from './events';

export function state<T>(initialValue: T): State<T> {
  return new State(initialValue);
}

export class State<T> implements IState<T> {
  private readonly listeners: Set<Callback<T>> = new Set();

  constructor(private value: T) { }

  getValue(): T {
    return this.value;
  }

  subscribe(scope: IScope, callback: Callback<T>): Unsubscribe {
    this.listeners.add(callback);
    return scope.addUnsubscribe(() => this.listeners.delete(callback));
  }

  bind(scope: IScope, callback: Callback<T>): Unsubscribe {
    callback(this.getValue());
    return this.subscribe(scope, callback);
  }

  setValue(newValue: T) {
    const oldValue = this.value;
    if (newValue !== oldValue) {
      this.value = newValue;
      this.listeners.forEach(callback => callback(newValue));
    }
  }

  push(event: T): void {
    this.setValue(event);
  }

  update(updater: Updater<T>): void {
    this.setValue(updater(this.value));
  }

}