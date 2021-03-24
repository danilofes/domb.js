import { IScope } from '../state';
import { IUnsubscribe } from '../vars/vars';
import { IDombNode, IModifier } from './dombNode';

export function onEvent<K extends keyof HTMLElementEventMap>(eventName: K): (callback: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any) => IModifier<IDombNode<HTMLElement>> {
  return (callback) => ({
    applyToNode(dombNode: IDombNode<HTMLElement>) {
      bindDomEvent(dombNode, dombNode.getDomNode(), eventName, callback);
    }
  });
}

export function bindDomEvent<K extends keyof HTMLElementEventMap>(scope: IScope, node: HTMLElement, eventName: K, callback: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any): IUnsubscribe {
  node.addEventListener(eventName, callback);
  return scope.addUnsubscribe(() => node.removeEventListener(eventName, callback));
}

export const on = {
  click: onEvent('click'),
  submit: onEvent('submit')
}
