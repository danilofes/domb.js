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
    if (newValue !== oldValue) {
      this.value = newValue;
      for (const l of this.listeners) {
        l(newValue, oldValue);
      }
    }
  }

  watch(listener: IListener<T>) {
    this.listeners.push(listener);
    return () => removeFromArray(this.listeners, listener);
  }

  clearListeners() {
    this.listeners.splice(0, this.listeners.length);
  }
}

const noop = () => { };

class SimpleVal<T> extends AbstractVal<T> implements IVal<T> {

  constructor(public readonly value: T) {
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


interface ArrayOpAdd<T> {
  type: 'add';
  index: number;
  item: T;
}

interface ArrayOpRemove {
  type: 'remove';
  index: number;
}

type ArrayOp<T> = ArrayOpAdd<T> | ArrayOpRemove;

interface ArrayDiff<T> {
  value: readonly T[],
  operations: ArrayOp<T>[]
}

export type IArrayListener<T> = (diff: ArrayDiff<T>) => void;


export interface IVals<T> {
  items: readonly T[],
  watch: (listener: IArrayListener<T>) => IUnsubscribe,
  indexVal: (index: number) => IVal<number>
}

export class ObservableArray<T> implements IVals<T> {
  private _items: T[];
  private _indexes: SimpleVar<number>[];
  private listeners: IArrayListener<T>[];

  constructor(items: T[]) {
    this._items = items;
    this._indexes = items.map((item, index) => new SimpleVar(index));
    this.listeners = [];
  }

  get items(): readonly T[] {
    return this._items;
  }

  indexVal(index: number): IVal<number> {
    return this._indexes[index];
  }

  addAt(index: number, item: T) {
    this._items.splice(index, 0, item);
    this._indexes.splice(index, 0, new SimpleVar(index));
    for (const l of this.listeners) {
      l({ value: this._items, operations: [{ type: 'add', index, item }] });
    }
    for (let i = index + 1; i < this._indexes.length; i++) {
      this._indexes[i].setValue(i);
    }
  }

  removeAt(index: number) {
    this._items.splice(index, 1);
    const deletedVars = this._indexes.splice(index, 1);
    for (const deletedVar of deletedVars) {
      deletedVar.clearListeners();
    }
    for (const l of this.listeners) {
      l({ value: this._items, operations: [{ type: 'remove', index }] });
    }
    for (let i = index; i < this._indexes.length; i++) {
      this._indexes[i].setValue(i);
    }
  }

  watch(listener: IArrayListener<T>) {
    this.listeners.push(listener);
    return () => removeFromArray(this.listeners, listener);
  }

}