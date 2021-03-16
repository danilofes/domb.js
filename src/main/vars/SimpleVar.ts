import { arrayRemove } from "./util";
import { IOnChange } from "./vars-api";
import { AbstractVar } from "./AbstractVar";


export class SimpleVar<T> extends AbstractVar<T> {
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
    return () => arrayRemove(this.listeners, listener);
  }

  clearListeners() {
    this.listeners.splice(0, this.listeners.length);
  }
}
