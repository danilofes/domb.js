import { Callback, IScope, IValueChangeEvent, IValueSource, Unsubscribe, isValueSource, ValueLike } from "./events";


export function asValueSource<T>(vsOrV: ValueLike<T>): IValueSource<T> {
  if (isValueSource(vsOrV)) {
    return vsOrV;
  } else {
    return new ConstValue<T>(vsOrV);
  }
}

export class ConstValue<T> implements IValueSource<T> {

  constructor(private _value: T) { }

  get value(): T {
    return this._value;
  }

  subscribe(scope: IScope, callback: Callback<IValueChangeEvent<T>>): Unsubscribe {
    return doNothing;
  }

  bind(scope: IScope, callback: Callback<T>): Unsubscribe {
    callback(this.value);
    return doNothing;
  }

}

const doNothing = () => { };
