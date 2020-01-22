

export type IOnChange<T> = (newValue: T, prevValue: T) => void;

export type IUnsubscribe = () => void;

export type IValFields<T> = {
  [K in (string & keyof T)]: IVal<T[K]>
}

export type IVarFields<T> = {
  [K in (string & keyof T)]: IVar<T[K]>
}

export interface IVal<T> {
  readonly value: T,
  watch(onChange: IOnChange<T>): IUnsubscribe,
  map<U>(mappingFn: (v: T) => U): IVal<U>,
  field<K extends keyof T>(field: K): IVal<T[K]>,
  readonly $: IValFields<T>
}

export interface IVar<T> extends IVal<T> {
  setValue: (newValue: T) => void,
  map<U>(mappingFn: (v: T) => U): IVal<U>,
  map<U>(mappingFn: (v: T) => U, inverseMappingFn: (v: U, prev: T) => T): IVar<U>,
  field<K extends keyof T>(field: K): IVar<T[K]>,
  readonly $: IVarFields<T>
}

export type IOnInsert<T> = (index: number, insertedValue: T) => void;

export type IOnDelete<T> = (index: number, deletedValue: T) => void;

export interface IValsHandler<T> {
  onInsert?: IOnInsert<T>,
  onDelete?: IOnDelete<T>
}

export interface IVals<T> {
  length: IVal<number>,
  itemAt: (index: number) => IVal<T>,
  indexValAt: (index: number) => IVal<number>,
  watch: (handler: IValsHandler<T>) => IUnsubscribe
}

export interface IVars<T> extends IVals<T> {
  itemAt: (index: number) => IVar<T>,
  insertAt: (index: number, value: T) => void,
  deleteAt: (index: number) => void
}
