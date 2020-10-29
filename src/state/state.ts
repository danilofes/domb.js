import { Callback, IScope, IState, IValueChangeEvent, Unsubscribe, Updater } from './events';
import { withTransaction } from './transaction';

export function state<T>(initialValue: T): State<T> {
  return new State(initialValue);
}

export class State<T> implements IState<T> {
  private readonly listeners: Set<Callback<IValueChangeEvent<T>>> = new Set();

  constructor(private value: T) { }

  getValue(): T {
    return this.value;
  }

  subscribe(scope: IScope, callback: Callback<IValueChangeEvent<T>>): Unsubscribe {
    this.listeners.add(callback);
    return scope.addUnsubscribe(() => this.listeners.delete(callback));
  }

  bind(scope: IScope, callback: Callback<T>): Unsubscribe {
    callback(this.getValue());
    return this.subscribe(scope, ({ newValue }) => callback(newValue));
  }

  setValue(newValue: T) {
    const prevValue = this.value;
    if (newValue !== prevValue) {
      this.value = newValue;
      withTransaction(transaction => {
        transaction.queue(this, { newValue, prevValue });
      })
    }
  }

  notifyListeners(valueChangeEvent: IValueChangeEvent<T>) {
    this.listeners.forEach(callback => callback(valueChangeEvent));
  }

  push(event: T): void {
    this.setValue(event);
  }

  update(updater: Updater<T>): void {
    this.setValue(updater(this.value));
  }

}