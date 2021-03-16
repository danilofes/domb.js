import { IScope, Unsubscribe } from "./events";

export class SimpleScope implements IScope {

  private readonly subscriptions: Set<Unsubscribe> = new Set();

  addUnsubscribe(unsubscribe: Unsubscribe): Unsubscribe {
    this.subscriptions.add(unsubscribe);
    return () => {
      this.subscriptions.delete(unsubscribe);
      unsubscribe();
    };
  }

  unsubscribeAll(): void {
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions.clear();
  }

}