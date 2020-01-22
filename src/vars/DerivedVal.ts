import { IVal, IOnChange } from "./vars-api";
import { AbstractVal } from "./AbstractVal";

export class DerivedVal<U> extends AbstractVal<U> {
  private cachedValue: U;

  constructor(private vals: IVal<any>[], private computeValue: (vals: any[]) => U) {
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