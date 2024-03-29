import { Callback, IScope, IValueChangeEvent, IValueSource, Unsubscribe } from "./events";
import { readAndNotify } from "./sourceCollector";

export function map<T, U>(source: IValueSource<U>, mappingFn: (value: U) => T) {
  return new MappedValue(source, mappingFn);
}

class MappedValue<T, U> implements IValueSource<T> {
  constructor(private source: IValueSource<U>, private mappingFn: (value: U) => T) {}

  get value(): T {
    return readAndNotify(this, () => this.mappingFn(this.source.value));
  }

  subscribe(scope: IScope, callback: Callback<IValueChangeEvent<T>>): Unsubscribe {
    return this.source.subscribe(scope, (ce) => {
      const newValue = this.mappingFn(ce.newValue);
      const prevValue = this.mappingFn(ce.prevValue);
      if (newValue !== prevValue) {
        callback({ newValue, prevValue });
      }
    });
  }

  bind(scope: IScope, callback: Callback<T>): Unsubscribe {
    callback(this.value);
    return this.subscribe(scope, ({ newValue }) => callback(newValue));
  }
}
