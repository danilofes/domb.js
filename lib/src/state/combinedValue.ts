import { Callback, IScope, IValueChangeEvent, IValueSource, Unsubscribe } from "./events";
import { SimpleScope } from "./simpleScope";

export type UnwrapedValueSource<T> = T extends IValueSource<infer V> ? V : never;

export type UnwrapedValueSourceTuple<T extends readonly IValueSource<any>[]> = {
  [K in keyof T]: UnwrapedValueSource<T[K]>
};

export function combine<A extends readonly IValueSource<any>[], T>(sources: readonly [...A], compute: (...args: UnwrapedValueSourceTuple<A>) => T): IValueSource<T> {
  return new CombinedValue<A, T>(sources, compute);
}


class CombinedValue<A extends readonly any[], T> extends SimpleScope implements IValueSource<T> {

  private readonly listeners: Set<Callback<IValueChangeEvent<T>>> = new Set();
  private lastValue: T | undefined = undefined;
  private started = false;

  constructor(private sources: readonly [...A], private compute: (...args: UnwrapedValueSourceTuple<A>) => T) {
    super();
  }

  getValue(): T {
    return this.computeValue();
  }

  private computeValue(): T {
    const values: UnwrapedValueSourceTuple<A> = this.sources.map(vs => vs.getValue()) as any;
    return this.compute(...values);
  }

  subscribe(scope: IScope, callback: Callback<IValueChangeEvent<T>>): Unsubscribe {
    this.start();
    this.listeners.add(callback);
    return scope.addUnsubscribe(() => {
      this.listeners.delete(callback);
      this.stop();
    });
  }

  bind(scope: IScope, callback: Callback<T>): Unsubscribe {
    callback(this.getValue());
    return this.subscribe(scope, ({ newValue }) => callback(newValue));
  }

  start() {
    if (!this.started) {
      this.started = true;
      this.lastValue = this.computeValue();
      const onSourceChange = () => {
        const prevValue = this.lastValue as T;
        const newValue = this.getValue();
        if (newValue !== prevValue) {
          this.listeners.forEach(callback => callback({ newValue, prevValue }));
        }
      }
      for (const source of this.sources) {
        source.subscribe(this, onSourceChange);
      }
    }
  }

  stop() {
    if (this.started) {
      this.started = false;
      this.lastValue = undefined;
      this.unsubscribeAll();
    }
  }
}