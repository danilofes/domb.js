import { asValueSource, ValueLike } from '../state';
import { IUnsubscribe } from '../vars/vars-api';
import { DombNode } from './dombNode';


type ValidNodeProperty<E extends Node, K extends keyof E> = E[K] extends string | number | boolean | null ? K : never;

type NodePropertiesConfig<E extends Node> = {
  [K in keyof E as ValidNodeProperty<E, K>]?: ValueLike<E[K]>;
};

type ElementAttributesConfig = {
  [key: string]: ValueLike<string | boolean>
};

type EventsConfig = {
  [K in keyof HTMLElementEventMap as `on${Capitalize<K>}`]?: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any;
};

export type ElementConfig<E extends HTMLElement> = NodePropertiesConfig<E> & EventsConfig & { attrs?: ElementAttributesConfig };


const EVENT_CONFIG_KEY = /^on([A-Z].*)$/;

export abstract class DombHtmlElement<E extends HTMLElement, C = ElementConfig<E>> extends DombNode<E, C> {
  constructor(el: E) {
    super(el);
  }

  acceptsChild(child: DombNode) {
    return true;
  }

  on<T extends DombHtmlElement<E>, K extends keyof HTMLElementEventMap>(this: T, eventName: K, callback: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any): IUnsubscribe {
    this.domNode.addEventListener(eventName, callback);
    return this.addUnsubscribe(() => this.domNode.removeEventListener(eventName, callback));
  }

  bindAttr(attr: string, vs: ValueLike<boolean | string>): IUnsubscribe {
    return asValueSource(vs).bind(this, value => {
      if (value === false) {
        this.domNode.removeAttribute(attr);
      } else if (value === true) {
        this.domNode.setAttribute(attr, '');
      } else {
        this.domNode.setAttribute(attr, value);
      }
    });
  }

  protected applyConfig(config: ElementConfig<E>): void {
    const { attrs, ...rest } = config;
    if (attrs) {
      for (const attr in attrs) {
        this.bindAttr(attr, attrs[attr]);
      }
    }
    for (const key in rest) {
      const configValue = (rest as any)[key];
      const match = key.match(EVENT_CONFIG_KEY);
      if (match) {
        const eventName = match[1].toLowerCase() as keyof HTMLElementEventMap;
        this.on(eventName, configValue);
      } else {
        this.bindProp(key as any, configValue);
      }
    }
  }
}

export class DombStaticHtmlElement<E extends HTMLElement> extends DombHtmlElement<E> {
  constructor(el: E) {
    super(el);
    this.status = 'mounted';
  }
}

export class DombDynamicHtmlElement<K extends keyof HTMLElementTagNameMap, C = ElementConfig<HTMLElementTagNameMap[K]>> extends DombHtmlElement<HTMLElementTagNameMap[K], C> {
  constructor(tagName: K) {
    super(document.createElement(tagName));
  }
}

export function root<E extends HTMLElement>(element: E | null): DombStaticHtmlElement<E> {
  if (element === null) {
    throw new Error('element should not be null');
  }
  return new DombStaticHtmlElement<E>(element);
}
