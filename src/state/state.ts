import { Callback, IScope, IState, IValueChangeEvent, Unsubscribe, Updater } from './events';
import { onCommitTransaction } from './transaction';

export function state<T>(initialValue: T): State<T> {
  return new State(initialValue);
}

export class State<T> implements IState<T> {
  private readonly listeners: Set<Callback<IValueChangeEvent<T>>> = new Set();
  private pendingChange: IValueChangeEvent<T> | null = null;

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
    const changeEvent = { newValue, prevValue: this.value };
    this.value = newValue;
    this.emitChangeAtEndOfTransaction(changeEvent);
  }

  emitChangeAtEndOfTransaction(valueChangeEvent: IValueChangeEvent<T>) {
    if (this.pendingChange) {
      this.pendingChange.newValue = valueChangeEvent.newValue;
    } else {
      this.pendingChange = valueChangeEvent;
      onCommitTransaction(() => {
        if (this.pendingChange && this.pendingChange.newValue !== this.pendingChange.prevValue) {
          const changeToNotify = this.pendingChange;
          this.pendingChange = null;
          this.listeners.forEach(callback => callback(changeToNotify));
        }
      });
    }
  }

  push(event: T): void {
    this.setValue(event);
  }

  update(updater: Updater<T>): void {
    this.setValue(updater(this.value));
  }

}