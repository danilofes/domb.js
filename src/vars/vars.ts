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

export function forEach<T>(vars: IVars<T>, consumer: (item: IVar<T>, index: IVal<number>) => void) {
  for (let i = 0, len = vars.length.value; i < len; i++) {
    consumer(vars.itemAt(i), vars.indexValAt(i));
  }
}
