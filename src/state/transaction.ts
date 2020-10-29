import { IState, IValueChangeEvent } from "./events";

let currentTransaction: Transaction | null = null;

export interface ITransaction {
  queue<T>(er: IState<T>, event: IValueChangeEvent<T>): void;
}

export function withTransaction(fn: (transaction: ITransaction) => void) {
  if (currentTransaction == null) {
    currentTransaction = new Transaction();
    fn(currentTransaction);
    currentTransaction.emitAll();
    currentTransaction = null;
  } else {
    fn(currentTransaction);
  }
}

class Transaction implements ITransaction {

  private pendingNotifications: Map<IState<any>, IValueChangeEvent<any>> = new Map();

  queue<T>(state: IState<T>, event: IValueChangeEvent<T>): void {
    const currentEvent = this.pendingNotifications.get(state);
    this.pendingNotifications.set(state, currentEvent ? { ...currentEvent, newValue: event.newValue } : event);
  }

  emitAll() {
    this.pendingNotifications.forEach((event, state) => state.notifyListeners(event));
    this.pendingNotifications.clear();
  }

}