import { removeFromArray, noop } from "./util";

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

export function VarArray<T>(value: T[]): ObservableArray<T> {
  return new ObservableArray<T>(value);
}

export function Val<T>(value: T): IVal<T> {
  return new SimpleVal<T>(value);
}

export function template(strings: TemplateStringsArray, ...vals: (IVal<string> | string)[]): IVal<string> {
  const normalizedVals = vals.map(s => typeof s === 'string' ? Val(s) : s);
  return new TemplateVal(strings, normalizedVals);
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


export interface ArrayOpAdd<T> {
  type: 'add';
  index: number;
  item: T;
}

export interface ArrayOpRemove {
  type: 'remove';
  index: number;
}

export type ArrayOp<T> = ArrayOpAdd<T> | ArrayOpRemove;

export interface ArrayDiff<T> {
  value: readonly T[],
  prevValue: readonly T[],
  operations: ArrayOp<T>[]
}

export type IArrayListener<T> = (diff: ArrayDiff<T>) => void;


export interface IVals<T> extends IVal<readonly T[]> {
  items: readonly T[],
  watchArray: (listener: IArrayListener<T>) => IUnsubscribe,
  indexVal: (index: number) => IVal<number>
}

export class ObservableArray<T> extends AbstractVal<readonly T[]> implements IVals<T> {
  private _items: T[];
  private _indexes: SimpleVar<number>[];
  private listeners: IArrayListener<T>[];
  readonly length: IVal<number>;

  constructor(items: T[]) {
    super();
    this._items = items;
    this._indexes = items.map((item, index) => new SimpleVar(index));
    this.listeners = [];
    this.length = new MappedVar<readonly T[], number>(this, array => array.length);
  }

  get items(): readonly T[] {
    return this._items;
  }

  get value(): readonly T[] {
    return this._items as readonly T[];
  }

  indexVal(index: number): IVal<number> {
    return this._indexes[index];
  }

  append(item: T) {
    this.addAt(this._items.length, item);
  }

  addAt(index: number, item: T) {
    const prevValue = [...this._items];
    this._items.splice(index, 0, item);
    this._indexes.splice(index, 0, new SimpleVar(index));
    for (const l of this.listeners) {
      l({ value: this._items, prevValue, operations: [{ type: 'add', index, item }] });
    }
    for (let i = index + 1; i < this._indexes.length; i++) {
      this._indexes[i].setValue(i);
    }
  }

  removeAt(index: number) {
    const prevValue = [...this._items];
    this._items.splice(index, 1);
    const deletedVars = this._indexes.splice(index, 1);
    for (const deletedVar of deletedVars) {
      deletedVar.clearListeners();
    }
    for (const l of this.listeners) {
      l({ value: this._items, prevValue, operations: [{ type: 'remove', index }] });
    }
    for (let i = index; i < this._indexes.length; i++) {
      this._indexes[i].setValue(i);
    }
  }

  watchArray(listener: IArrayListener<T>) {
    this.listeners.push(listener);
    return () => removeFromArray(this.listeners, listener);
  }

  watch(listener: IListener<readonly T[]>) {
    return this.watchArray(diff => listener(diff.value, diff.prevValue));
  }

}


abstract class DerivedVal<T, U> extends AbstractVal<U> {
  private cachedValue: U;

  constructor(private vals: IVal<T>[], private computeValue: (vals: T[]) => U) {
    super();
    this.cachedValue = computeValue(vals.map(iVal => iVal.value));
  }

  get value() {
    return this.cachedValue;
  }

  watch(listener: IListener<U>) {
    const subscriptions = this.vals.map(iVal => {
      return iVal.watch((newValue, prevValue) => {
        const lastComputedValue = this.cachedValue;
        const newComputedValue = this.computeValue(this.vals.map(iVal => iVal.value));
        if (!this.isEqual(newComputedValue, lastComputedValue)) {
          this.cachedValue = newComputedValue;
          listener(newComputedValue, lastComputedValue);
        }
      });
    });

    return () => {
      for (let undo of subscriptions) {
        undo();
      }
    }
  }

  isEqual(v1: U, v2: U): boolean {
    return v1 === v2;
  }
}

class TemplateVal extends DerivedVal<string, string> {
  constructor(private strings: TemplateStringsArray, vals: IVal<string>[]) {
    super(vals, values => applyTemplateVals(strings, values));
  }
}

function applyTemplateVals(strings: TemplateStringsArray, values: string[]): string {
  let result = '';
  for (let i = 0; i < strings.length; i++) {
    result += strings[i] + (values[i] || '');
  }
  return result;
}
