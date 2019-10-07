import { removeFromArray } from "./util";

export type IListener<T> = (newValue: T, prevValue: T) => void;

export type IUnsubscribe = () => void;

export interface IVal<T> {
  value: T,
  watch: (listener: IListener<T>) => IUnsubscribe,
  map: <U>(fn: (v: T) => U) => IVal<U>
}

export interface IVar<T> extends IVal<T> {
  setValue: (newValue: T) => void
}

export function Var<T>(value: T): IVar<T> {
  return new SimpleVar<T>(value);
}

export function Val<T>(value: T): IVal<T> {
  return new SimpleVal<T>(value);
}


abstract class AbstractVal<T> implements IVal<T> {

  abstract get value(): T;

  abstract watch(listener: IListener<T>): IUnsubscribe;

  map<U>(mappingFn: (v: T) => U): IVal<U> {
    return new MappedVar<T, U>(this, mappingFn);
  }
}

class SimpleVar<T> extends AbstractVal<T> implements IVar<T> {
  private listeners: IListener<T>[];

  constructor(public value: T) {
    super();
    this.listeners = [];
  }

  setValue(newValue: T) {
    const oldValue = this.value;
    this.value = newValue;
    for (const l of this.listeners) {
      l(newValue, oldValue);
    }
  }

  watch(listener: IListener<T>) {
    this.listeners.push(listener);
    return () => removeFromArray(this.listeners, listener);
  }

}

const noop = () => { };

class SimpleVal<T> extends AbstractVal<T> implements IVal<T> {

  constructor(public value: T) {
    super();
  }

  watch(listener: IListener<T>) {
    return noop;
  }

}

class MappedVar<T, U> extends AbstractVal<U> {

  constructor(private mainVar: IVal<T>, private mappingFn: (v: T) => U) {
    super();
  }

  get value(): U {
    return this.mappingFn(this.mainVar.value);
  }

  watch(listener: IListener<U>) {
    return this.mainVar.watch((newValue: T, prevValue: T) => {
      listener(this.mappingFn(newValue), this.mappingFn(prevValue));
    });
  }

}