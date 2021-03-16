import { IVal, IVar, IOnChange, IValsHandler, IVars } from "./vars-api";
import { arrayRemove } from "./util";
import { SimpleVar } from "./SimpleVar";
import { AbstractVal } from "./AbstractVal";


export class MutableArrayVar<T> implements IVars<T> {
  private entries: [SimpleVar<number>, SimpleVar<T>][];
  private handlers: IValsHandler<T>[];
  readonly length: IVal<number>;

  constructor(items?: T[]) {

    this.entries = items ? items.map((value, index) => [new SimpleVar(index), new SimpleVar(value)]) : [];
    this.handlers = [];
    const self = this;

    class LengthVal extends AbstractVal<number>{
      get value() {
        return self.entries.length;
      }
      watch(onChange: IOnChange<number>) {
        return self.watch({
          onInsert: () => onChange(self.entries.length, self.entries.length - 1),
          onDelete: () => onChange(self.entries.length, self.entries.length + 1)
        });
      }
    }

    this.length = new LengthVal();
  }

  indexValAt(index: number): IVal<number> {
    return this.entries[index][0];
  }

  itemAt(index: number): IVar<T> {
    return this.entries[index][1];
  }

  append(item: T) {
    this.insertAt(this.entries.length, item);
  }

  insertAt(index: number, item: T) {
    const newValue = new SimpleVar(item);
    this.entries.splice(index, 0, [new SimpleVar(index), newValue]);
    for (const handler of this.handlers) {
      if (handler.onInsert) {
        handler.onInsert(index, item);
      }
    }

    this.updateIndexes(index + 1);
  }

  deleteAt(index: number) {
    const deletedEntry = this.entries.splice(index, 1)[0];
    deletedEntry[0].clearListeners();
    deletedEntry[1].clearListeners();

    for (const handler of this.handlers) {
      if (handler.onDelete) {
        handler.onDelete(index, deletedEntry[1].value);
      }
    }

    this.updateIndexes(index);
  }

  watch(handler: IValsHandler<T>) {
    this.handlers.push(handler);
    return () => arrayRemove(this.handlers, handler);
  }

  private updateIndexes(startAt: number) {
    for (let i = startAt; i < this.entries.length; i++) {
      this.entries[i][0].setValue(i);
    }
  }

}