
export function state<T>(initialValue: T): State<T> {
  return new State(initialValue);
}

type Callback<T> = (value: T) => void;

export class State<T> {
  private listeners: Callback<T>[];

  constructor(private value: T) {
    this.listeners = [];
  }

  bind(callback: Callback<T>) {
    callback(this.value);
    this.listeners.push(callback);
  }

  setValue(newValue: T) {
    const oldValue = this.value;
    if (newValue !== oldValue) {
      this.value = newValue;
      for (const callback of this.listeners) {
        callback(newValue);
      }
    }
  }

  private clearListeners() {
    this.listeners.splice(0, this.listeners.length);
  }

}