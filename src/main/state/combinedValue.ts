import { Callback, IScope, IValueChangeEvent, IValueSource, Unsubscribe } from "./events";
import { SimpleScope } from "./simpleScope";
import { asValueSource } from "./constValue";
import { map } from "./mappedValue";
import { ConstValue } from "./constValue";

export type UnwrapedValueSource<T> = T extends IValueSource<infer V> ? V : never;

export type UnwrapedValueSourceTuple<T extends readonly IValueSource<any>[]> = {
  [K in keyof T]: UnwrapedValueSource<T[K]>
};


export function compute<T, T1>(source: IValueSource<T1>, computeFn: (a1: T1) => T): IValueSource<T>;
export function compute<T, T1, T2>(sources: [IValueSource<T1>, IValueSource<T2>], computeFn: (a1: T1, a2: T2) => T): IValueSource<T>;
export function compute<T, T1, T2, T3>(sources: [IValueSource<T1>, IValueSource<T2>, IValueSource<T3>], computeFn: (a1: T1, a2: T2, a3: T3) => T): IValueSource<T>;
export function compute<T, T1, T2, T3, T4>(sources: [IValueSource<T1>, IValueSource<T2>, IValueSource<T3>, IValueSource<T4>], computeFn: (a1: T1, a2: T2, a3: T3, a4: T4) => T): IValueSource<T>;
export function compute<T, E>(sources: IValueSource<E>[], computeFn: (...args: E[]) => T): IValueSource<T>;
export function compute<T>(sources: IValueSource<any>[] | IValueSource<any>, computeFn: (...args: any) => T): IValueSource<T> {
  if (Array.isArray(sources)) {
    return new CombinedValue<T>(sources, computeFn);
  } else {
    return map(sources, computeFn);
  }
}


class CombinedValue<T> extends SimpleScope implements IValueSource<T> {

  private readonly listeners: Set<Callback<IValueChangeEvent<T>>> = new Set();
  private lastValue: T | undefined = undefined;
  private started = false;

  constructor(private sources: IValueSource<any>[], private computeFn: (...args: any[]) => T) {
    super();
  }

  getValue(): T {
    return this.computeValue();
  }

  private computeValue(): T {
    const values: any[] = this.sources.map(vs => vs.getValue());
    return this.computeFn(...values);
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
      this.lastValue = this.getValue();
      const onSourceChange = () => {
        const prevValue = this.lastValue as T;
        const newValue = this.getValue();
        if (newValue !== prevValue) {
          this.lastValue = newValue;
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

export function textVal(arg0: TemplateStringsArray, ...args: unknown[]): IValueSource<string> {
  const valueSources = args.map(asValueSource);
  if (valueSources.length === 0) {
    return new ConstValue(applyTemplateString(arg0, []));
  } else if (valueSources.length === 1) {
    return map(valueSources[0], (v0) => applyTemplateString(arg0, [v0]))
  } else {
    return compute(valueSources, (...values) => {
      return applyTemplateString(arg0, values);
    });
  }
}

function applyTemplateString(strs: TemplateStringsArray, args: unknown[]): string {
  var result: string = strs[0];
  for (var i = 1; i < strs.length; i++) {
    result += args[i - 1];
    result += strs[i];
  }
  return result;
}
