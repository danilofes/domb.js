import { Callback, IScope, IValueChangeEvent, IValueSource, Unsubscribe, isValueSource } from "./events";

export type ValueLike<T> = IValueSource<T> | T;

export function asValueSource<T>(vsOrV: ValueLike<T>): IValueSource<T> {
  if (isValueSource(vsOrV)) {
    return vsOrV;
  } else {
    return new ConstValue<T>(vsOrV);
  }
}

export class ConstValue<T> implements IValueSource<T> {

  constructor(private value: T) { }

  getValue(): T {
    return this.value;
  }

  subscribe(scope: IScope, callback: Callback<IValueChangeEvent<T>>): Unsubscribe {
    return doNothing;
  }

  bind(scope: IScope, callback: Callback<T>): Unsubscribe {
    callback(this.getValue());
    return doNothing;
  }

}

const doNothing = () => { };
