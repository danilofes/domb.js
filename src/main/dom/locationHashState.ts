import { BaseState, Callback, IScope, IValueChangeEvent, Unsubscribe } from "../state";

class LocationHashState extends BaseState<string> {

  get value(): string {
    return window.location.hash;
  }

  set value(newValue: string) {
    window.location.hash = newValue;
  }

  subscribe(scope: IScope, callback: Callback<IValueChangeEvent<string>>): Unsubscribe {
    const handler = (evt: HashChangeEvent) => {
      const prevValue = '#' + (evt.oldURL.split('#')[1] || '/');
      callback({ newValue: window.location.hash, prevValue });
    };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }

}

export function locationHashState() {
  return new LocationHashState();
}
