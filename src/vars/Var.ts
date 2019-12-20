

export type IOnChange<T> = (newValue: T, prevValue: T) => void;

export type IUnsubscribe = () => void;

export interface IVal<T> {
  value: T,
  watch: (onChange: IOnChange<T>) => IUnsubscribe
}

export interface IVar<T> extends IVal<T> {
  setValue: (newValue: T) => void
}

export type IOnInsert<T> = (index: number, insertedValue: T) => void;

export type IOnDelete<T> = (index: number, deletedValue: T) => void;

export type IOnMove<T> = (indexFrom: number, indexTo: number) => void;

export interface IValsHandler<T> {
  onInsert?: IOnInsert<T>,
  onDelete?: IOnDelete<T>,
  onMove?: IOnMove<T>
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
  deleteAt: (index: number) => void,
  move: (indexFrom: number, indexTo: number) => void
}
