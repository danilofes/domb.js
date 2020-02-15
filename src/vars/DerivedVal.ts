import { IVal, IOnChange } from "./vars-api";
import { AbstractVal } from "./AbstractVal";
import { arrayReplaceAt } from "./util";

export class DerivedVal<U> extends AbstractVal<U> {

  constructor(private vals: IVal<any>[], private computeValue: (vals: any[]) => U) {
    super();
  }

  get value() {
    return this.computeValue(this.vals.map(iVal => iVal.value));
  }

  watch(listener: IOnChange<U>) {
    const subscriptions = this.vals.map((iVal, i) => {
      return iVal.watch((newValue, prevValue) => {
        const newValues = this.vals.map(iVal => iVal.value),
          prevValues = arrayReplaceAt(newValues, i, prevValue),
          newComputedValue = this.computeValue(newValues),
          prevComputedValue = this.computeValue(prevValues);
        if (newComputedValue !== prevComputedValue) {
          listener(newComputedValue, prevComputedValue);
        }
      });
    });

    return () => {
      for (let undo of subscriptions) {
        undo();
      }
    }
  }
}