import { IVal, IValFields, IOnChange, IUnsubscribe } from "./vars-api";

export abstract class AbstractVal<T> implements IVal<T> {

  public readonly $: IValFields<T>;

  constructor() {
    const self = this;
    this.$ = new Proxy<IValFields<T>>({} as any, {
      get(target, name) {
        return self.field(name as any);
      }
    });
  }

  abstract get value(): T;

  abstract watch(listener: IOnChange<T>): IUnsubscribe;

  map<U>(mappingFn: (v: T) => U): IVal<U> {
    return new MappedVal<T, U>(this, mappingFn);
  }

  field<K extends keyof T>(field: K): IVal<T[K]> {
    return new MappedVal<T, T[K]>(this, (vt: T) => vt[field]);
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