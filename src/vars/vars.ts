import { removeFromArray, noop } from "./util";

export type IListener<T> = (newValue: T, prevValue: T) => void;

export type IUnsubscribe = () => void;

export interface IVal<T> {
  value: T,
  watch: (listener: IListener<T>) => IUnsubscribe,
  map: <U>(fn: (v: T) => U) => IVal<U>
}

export function field<T extends {}, K extends keyof T>(variable: IVar<T>, field: K): IVar<T[K]> {
  return new MappedVar<T, T[K]>(
    variable,
    (vt: T) => vt[field],
    (vu: T[K], prevVt: T) => ({ ...prevVt, [field]: vu }));
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
    return new MappedVal<T, U>(this, mappingFn);
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

class MappedVal<T, U> extends AbstractVal<U> {

  constructor(private mainVal: IVal<T>, private mappingFn: (v: T) => U) {
    super();
  }

  get value(): U {
    return this.mappingFn(this.mainVal.value);
  }

  watch(listener: IListener<U>) {
    return this.mainVal.watch((newValue: T, prevValue: T) => {
      listener(this.mappingFn(newValue), this.mappingFn(prevValue));
    });
  }

}

class MappedVar<T, U> extends MappedVal<T, U> implements IVar<U> {

  constructor(private mainVar: IVar<T>, mappingFn: (v: T) => U, private inverseMappingFn: (v: U, prev: T) => T) {
    super(mainVar, mappingFn);
  }

  setValue(newValue: U) {
    const prevValue = this.mainVar.value;
    this.mainVar.setValue(this.inverseMappingFn(newValue, prevValue));
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
  forEach: (fn: (item: IVar<T>, index: IVal<number>) => void) => void,
  indexValAt: (index: number) => IVal<number>,
  itemAt: (index: number) => IVar<T>
}

export class ObservableArray<T> extends AbstractVal<readonly T[]> implements IVals<T> {
  private entries: [SimpleVar<number>, SimpleVar<T>][];
  //private _items: T[];
  //private _indexes: SimpleVar<number>[];
  private listeners: IArrayListener<T>[];
  readonly length: IVal<number>;

  constructor(items: T[]) {
    super();
    this.entries = items.map((value, index) => [new SimpleVar(index), new SimpleVar(value)]);
    //this._items = items;
    //this._indexes = items.map((item, index) => new SimpleVar(index));
    this.listeners = [];
    this.length = new MappedVal<readonly T[], number>(this, array => array.length);
  }

  get items(): readonly T[] {
    return this.entries.map(e => e[1].value);
  }

  get value(): readonly T[] {
    return this.items;
  }

  forEach(fn: (item: IVar<T>, index: IVal<number>) => void) {
    for (const entry of this.entries) {
      fn(entry[1], entry[0]);
    }
  }

  indexValAt(index: number): IVal<number> {
    return this.entries[index][0];
  }

  itemAt(index: number): IVar<T> {
    return this.entries[index][1];
  }

  append(item: T) {
    this.addAt(this.entries.length, item);
  }

  addAt(index: number, item: T) {
    const prevValue = this.items;
    this.entries.splice(index, 0, [new SimpleVar(index), new SimpleVar(item)]);
    for (const l of this.listeners) {
      l({ value: this.items, prevValue, operations: [{ type: 'add', index, item }] });
    }
    for (let i = index + 1; i < this.entries.length; i++) {
      this.entries[i][0].setValue(i);
    }
  }

  removeAt(index: number) {
    const prevValue = this.items;
    const deletedEntries = this.entries.splice(index, 1);

    for (const deletedEntry of deletedEntries) {
      deletedEntry[0].clearListeners();
      deletedEntry[1].clearListeners();
    }
    for (const l of this.listeners) {
      l({ value: this.items, prevValue, operations: [{ type: 'remove', index }] });
    }
    for (let i = index; i < this.entries.length; i++) {
      this.entries[i][0].setValue(i);
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
