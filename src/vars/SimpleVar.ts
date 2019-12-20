import { removeFromArray, noop } from "./util";
import { IVal, IOnChange, IUnsubscribe, IVar } from "./Var";



export abstract class AbstractVal<T> implements IVal<T> {

  abstract get value(): T;

  abstract watch(listener: IOnChange<T>): IUnsubscribe;

}

export class SimpleVar<T> extends AbstractVal<T> implements IVar<T> {
  private listeners: IOnChange<T>[];

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

  watch(listener: IOnChange<T>) {
    this.listeners.push(listener);
    return () => removeFromArray(this.listeners, listener);
  }

  clearListeners() {
    this.listeners.splice(0, this.listeners.length);
  }
}


export class ConstVal<T> implements IVal<T> {

  constructor(public readonly value: T) { }

  watch(listener: IOnChange<T>) {
    return noop;
  }

}

export class MappedVal<T, U> extends AbstractVal<U> {

  constructor(private mainVal: IVal<T>, private mappingFn: (v: T) => U) {
    super();
  }

  get value(): U {
    return this.mappingFn(this.mainVal.value);
  }

  watch(listener: IOnChange<U>) {
    return this.mainVal.watch((newValue: T, prevValue: T) => {
      listener(this.mappingFn(newValue), this.mappingFn(prevValue));
    });
  }

}

export class MappedVar<T, U> extends MappedVal<T, U> implements IVar<U> {

  constructor(private mainVar: IVar<T>, mappingFn: (v: T) => U, private inverseMappingFn: (v: U, prev: T) => T) {
    super(mainVar, mappingFn);
  }

  setValue(newValue: U) {
    const prevValue = this.mainVar.value;
    this.mainVar.setValue(this.inverseMappingFn(newValue, prevValue));
  }
}

export abstract class DerivedVal<T, U> extends AbstractVal<U> {
  private cachedValue: U;

  constructor(private vals: IVal<T>[], private computeValue: (vals: T[]) => U) {
    super();
    this.cachedValue = computeValue(vals.map(iVal => iVal.value));
  }

  get value() {
    return this.cachedValue;
  }

  watch(listener: IOnChange<U>) {
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

export class TemplateVal extends DerivedVal<string, string> {
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
