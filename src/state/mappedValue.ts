import { Callback, IScope, IValueChangeEvent, IValueSource, Unsubscribe } from "./events";

export function map<T, U>(source: IValueSource<U>, mappingFn: (value: U) => T) {
  return new MappedValue(source, mappingFn);
}

class MappedValue<T, U> implements IValueSource<T> {

  constructor(private source: IValueSource<U>, private mappingFn: (value: U) => T) { }

  getValue(): T {
    return this.mappingFn(this.source.getValue());
  }

  subscribe(scope: IScope, callback: Callback<IValueChangeEvent<T>>): Unsubscribe {
    return this.source.subscribe(scope, ce => {
      const newValue = this.mappingFn(ce.newValue);
      const prevValue = this.mappingFn(ce.prevValue);
      if (newValue !== prevValue) {
        callback({ newValue, prevValue });
      }
    });
  }

  bind(scope: IScope, callback: Callback<T>): Unsubscribe {
    callback(this.getValue());
    return this.subscribe(scope, ({ newValue }) => callback(newValue));
  }

}