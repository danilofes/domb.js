import { IVar, IVarFields, IOnChange, IUnsubscribe, IVal } from "./vars-api";
import { MappedVal } from "./AbstractVal";

export abstract class AbstractVar<T> implements IVar<T> {

  public readonly $: IVarFields<T>;

  constructor() {
    const self = this;
    this.$ = new Proxy<IVarFields<T>>({} as any, {
      get(target, name) {
        return self.field(name as any);
      }
    });
  }

  abstract get value(): T;

  abstract setValue(newValue: T): void;

  abstract watch(listener: IOnChange<T>): IUnsubscribe;

  map<U>(mappingFn: (v: T) => U): IVal<U>;
  map<U>(mappingFn: (v: T) => U, inverseMappingFn: (v: U, prev: T) => T): IVar<U>;
  map<U>(mappingFn: (v: T) => U, inverseMappingFn?: (v: U, prev: T) => T): IVal<U> | IVar<U> {
    if (inverseMappingFn) {
      return new MappedVar<T, U>(this, mappingFn, inverseMappingFn);
    } else {
      return new MappedVal<T, U>(this, mappingFn);
    }
  }

  is(mappingFn: (v: T) => boolean): IVal<boolean> {
    return this.map(mappingFn);
  }

  field<K extends keyof T>(field: K): IVar<T[K]> {
    return new MappedVar<T, T[K]>(this,
      (vt: T) => vt[field],
      (vu: T[K], prevVt: T) => ({ ...prevVt, [field]: vu }));
  }
}

export class MappedVar<T, U> extends AbstractVar<U> {

  constructor(private mainVar: IVar<T>, private mappingFn: (v: T) => U, private inverseMappingFn: (v: U, prev: T) => T) {
    super();
  }

  get value(): U {
    return this.mappingFn(this.mainVar.value);
  }

  setValue(newValue: U) {
    const prevValue = this.mainVar.value;
    this.mainVar.setValue(this.inverseMappingFn(newValue, prevValue));
  }

  watch(listener: IOnChange<U>) {
    return this.mainVar.watch((newValue: T, prevValue: T) => {
      listener(this.mappingFn(newValue), this.mappingFn(prevValue));
    });
  }
}
