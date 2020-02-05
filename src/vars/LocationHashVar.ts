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
      console.log('hashchange event');
      listener(ev.newURL, ev.oldURL);
    };

    window.addEventListener('hashchange', handler);

    return () => {
      console.log('remove hashchange listener');
      window.removeEventListener('hashchange', handler);
    };
  }

}
