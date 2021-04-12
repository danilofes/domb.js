import { DombDynamicHtmlElement, ElementConfig } from './dombHtmlElement';
import { DombHtmlInputText, DombHtmlInputCheckbox, DombHtmlInputSubmit, ElementConfigWithModel } from './dombHtmlInputElements';
import { DombNode } from './dombNode';
import { text } from './textNode';


export type Modifiers<C> = (C | DombNode | string)[];

export const el = {
  form: dombElementOf('form'),
  div: dombElementOf('div'),
  a: dombElementOf('a'),
  span: dombElementOf('span'),
  ul: dombElementOf('ul'),
  li: dombElementOf('li'),
  button: dombElementOf('button'),
  table: dombElementOf('table'),
  tr: dombElementOf('tr'),
  td: dombElementOf('td'),
  inputText: function (...modifiers: Modifiers<ElementConfigWithModel<HTMLInputElement, string>>) {
    return configure(new DombHtmlInputText(), modifiers);
  },
  inputCheckbox: function (...modifiers: Modifiers<ElementConfigWithModel<HTMLInputElement, boolean>>) {
    return configure(new DombHtmlInputCheckbox(), modifiers);
  },
  inputSubmit: function (...modifiers: Modifiers<ElementConfig<HTMLInputElement>>) {
    return configure(new DombHtmlInputSubmit(), modifiers);
  }
}

function dombElementOf<K extends keyof HTMLElementTagNameMap>(tagName: K): (...modifiers: Modifiers<ElementConfig<HTMLElementTagNameMap[K]>>) => DombDynamicHtmlElement<K> {
  return function (...modifiers) {
    return configure(new DombDynamicHtmlElement<K>(tagName), modifiers);
  }
}

function configure<C extends unknown, T extends DombNode<Node, C>>(dn: T, modifiers: Modifiers<C>): T {
  for (const modifier of modifiers) {
    if (typeof modifier === 'string') {
      dn.addChild(text(modifier));
    } else if (modifier instanceof DombNode) {
      dn.addChild(modifier);
    } else {
      dn.apply(modifier);
    }
  }
  return dn;
}
