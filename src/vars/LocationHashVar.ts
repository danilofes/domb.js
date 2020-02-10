import { IOnChange } from "./vars-api";
import { AbstractVar } from "./AbstractVar";


export class LocationHashVar extends AbstractVar<string> {

  constructor() {
    super();
  }

  get value() {
    return window.location.hash;
  }

  setValue(newValue: string) {
    window.location.hash = newValue;
  }

  watch(listener: IOnChange<string>) {
    const handler = (ev: HashChangeEvent) => {
      const oldHash = '#' + (ev.oldURL.split('#')[1] || '/');
      listener(window.location.hash, oldHash);
    };

    window.addEventListener('hashchange', handler);

    return () => window.removeEventListener('hashchange', handler);
  }

}
