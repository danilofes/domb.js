import { IVar, IVal, IVars } from "./Var";
import { MappedVar, MappedVal, SimpleVar, ConstVal, TemplateVal } from "./SimpleVar";
import { ObservableArray } from "./ObservableArray";

export * from "./Var";

export function Var<T>(value: T): SimpleVar<T> {
  return new SimpleVar<T>(value);
}

export function Val<T>(value: T): ConstVal<T> {
  return new ConstVal<T>(value);
}

export function template(strings: TemplateStringsArray, ...vals: (IVal<string> | string)[]): IVal<string> {
  const normalizedVals = vals.map(s => typeof s === 'string' ? Val(s) : s);
  return new TemplateVal(strings, normalizedVals);
}

export function Vars<T>(value?: T[]): ObservableArray<T> {
  return new ObservableArray<T>(value);
}

export function field<T extends {}, K extends keyof T>(variable: IVar<T>, field: K): IVar<T[K]> {
  return new MappedVar<T, T[K]>(
    variable,
    (vt: T) => vt[field],
    (vu: T[K], prevVt: T) => ({ ...prevVt, [field]: vu }));
}

export function map<T, U>(value: IVal<T>, mappingFn: (v: T) => U): IVal<U> {
  return new MappedVal<T, U>(value, mappingFn);
}

export function forEach<T>(vars: IVars<T>, consumer: (item: IVar<T>, index: IVal<number>) => void) {
  for (let i = 0, len = vars.length.value; i < len; i++) {
    consumer(vars.itemAt(i), vars.indexValAt(i));
  }
}
