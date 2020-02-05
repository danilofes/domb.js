import { IOnChange } from "./vars-api";
import { AbstractVar } from "./AbstractVar";


export class LocationHashVar extends AbstractVar<string> {

  private cachedValue: string;

  constructor() {
    super();
    this.cachedValue = window.location.hash;
  }

  get value() {
    return window.location.hash;
  }

  setValue(newValue: string) {
    window.location.hash = newValue;
  }

  watch(listener: IOnChange<string>) {
    const handler = (ev: HashChangeEvent) => {
      listener(window.location.hash, this.cachedValue);
      this.cachedValue = window.location.hash;
    };

    window.addEventListener('hashchange', handler);

    return () => window.removeEventListener('hashchange', handler);
  }

}
