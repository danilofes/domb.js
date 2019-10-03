
type IListener<T> = (newValue: T) => void;

export interface IVar<T> {
  value: T,
  watch: (listener: IListener<T>) => void,
  map: <U>(fn: (v: T) => U) => IVar<U>
}


export interface IMutableVar<T> extends IVar<T> {
  setValue: (newValue: T) => void
}

export function Var<T>(value: T): IMutableVar<T> {
  return new SimpleVar<T>(value);
}


abstract class AbstractVar<T> implements IVar<T> {

  abstract get value(): T;

  abstract watch(listener: IListener<T>): void;

  map<U>(mappingFn: (v: T) => U): IVar<U> {
    return new MappedVar<T, U>(this, mappingFn);
  }
}

class SimpleVar<T> extends AbstractVar<T> implements IMutableVar<T> {
  private listeners: IListener<T>[];

  constructor(public value: T) {
    super();
    this.listeners = [];
  }

  setValue(newValue: T) {
    this.value = newValue;
    for (const l of this.listeners) {
      l(newValue);
    }
  }

  watch(listener: IListener<T>) {
    this.listeners.push(listener);
  }

}

class MappedVar<T, U> extends AbstractVar<U> {

  constructor(private mainVar: IVar<T>, private mappingFn: (v: T) => U) {
    super();
  }

  get value(): U {
    return this.mappingFn(this.mainVar.value);
  }

  watch(listener: IListener<U>) {
    this.mainVar.watch((value: T) => listener(this.mappingFn(value)));
  }

}