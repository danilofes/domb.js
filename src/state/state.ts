
export function state<T>(initialValue: T): State<T> {
  return new State(initialValue);
}

type Callback<T> = (value: T) => void;
type Unsubscribe = () => void;

export class State<T> {
  private listeners: Set<Callback<T>>;

  constructor(private value: T) {
    this.listeners = new Set();
  }

  bind(callback: Callback<T>): Unsubscribe {
    callback(this.value);
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  setValue(newValue: T) {
    const oldValue = this.value;
    if (newValue !== oldValue) {
      this.value = newValue;
      this.listeners.forEach(callback => callback(newValue));
    }
  }

  private clearListeners() {
    this.listeners.clear();
  }

}