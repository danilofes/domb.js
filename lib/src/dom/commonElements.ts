import { DombDynamicHtmlElement } from './dombHtmlElement';
import { DombHtmlInputText, DombHtmlInputCheckbox, DombHtmlInputSubmit } from './dombHtmlInputElements';
import { IModifier } from './dombNode';

export const el = {
  form: dombElementOf('form'),
  div: dombElementOf('div'),
  span: dombElementOf('span'),
  ul: dombElementOf('ul'),
  li: dombElementOf('ul'),
  button: dombElementOf('button'),
  inputText: function (...modifiers: IModifier<DombHtmlInputText, HTMLInputElement>[]) {
    return new DombHtmlInputText(modifiers);
  },
  inputCheckbox: function (...modifiers: IModifier<DombHtmlInputCheckbox, HTMLInputElement>[]) {
    return new DombHtmlInputCheckbox(modifiers);
  },
  inputSubmit: function (...modifiers: IModifier<DombHtmlInputSubmit, HTMLInputElement>[]) {
    return new DombHtmlInputSubmit(modifiers);
  }
}

function dombElementOf<K extends keyof HTMLElementTagNameMap>(tagName: K): (...modifiers: IModifier<DombDynamicHtmlElement<K>, HTMLElementTagNameMap[K]>[]) => DombDynamicHtmlElement<K> {
  return function (...modifiers) {
    // TODO
    return new DombDynamicHtmlElement<K>(tagName, modifiers);
  }
}
