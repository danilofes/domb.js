import { Callback, IScope, IValueSource, Unsubscribe } from "./events";
import { SimpleScope } from "./simpleScope";

export type UnwrapedValueSource<T> = T extends IValueSource<infer V> ? V : never;

export type UnwrapedValueSourceTuple<T extends readonly IValueSource<any>[]> = {
  [K in keyof T]: UnwrapedValueSource<T[K]>
};

export function combine<A extends readonly IValueSource<any>[], T>(sources: readonly [...A], compute: (...args: UnwrapedValueSourceTuple<A>) => T): IValueSource<T> {
  return new CombinedValue<A, T>(sources, compute);
}


class CombinedValue<A extends readonly any[], T> extends SimpleScope implements IValueSource<T> {

  private readonly listeners: Set<Callback<T>> = new Set();

  constructor(private sources: readonly [...A], private compute: (...args: UnwrapedValueSourceTuple<A>) => T) {
    super();
  }

  getValue(): T {
    const values: UnwrapedValueSourceTuple<A> = this.sources.map(vs => vs.getValue()) as any;
    return this.compute(...values);
  }

  subscribe(scope: IScope, callback: Callback<T>): Unsubscribe {
    this.start();
    this.listeners.add(callback);
    return scope.addUnsubscribe(() => {
      this.listeners.delete(callback);
      this.stop();
    });
  }

  bind(scope: IScope, callback: Callback<T>): Unsubscribe {
    callback(this.getValue());
    return this.subscribe(scope, callback);
  }

  start() {
    if (this.listeners.size === 0) {
      const onSourceChange = () => {
        const newValue = this.getValue();
        this.listeners.forEach(callback => callback(newValue));
      }
      for (const source of this.sources) {
        source.subscribe(this, onSourceChange);
      }
    }
  }

  stop() {
    if (this.listeners.size === 0) {
      this.unsubscribeAll();
    }
  }
}
