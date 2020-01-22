import { AbstractVal } from "./AbstractVal";
import { IOnChange } from "./vars-api";
import { noop } from "./util";

export class ConstVal<T> extends AbstractVal<T> {

  constructor(public readonly value: T) {
    super();
  }

  watch(listener: IOnChange<T>) {
    return noop;
  }

}