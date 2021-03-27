import { DombDynamicHtmlElement } from './dombHtmlElement';
import { DombHtmlInputText, DombHtmlInputCheckbox, DombHtmlInputSubmit } from './dombHtmlInputElements';
import { IModifier } from './dombNode';

export const el = {
  form: dombElementOf('form'),
  div: dombElementOf('div'),
  span: dombElementOf('span'),
  ul: dombElementOf('ul'),
  li: dombElementOf('li'),
  button: dombElementOf('button'),
  table: dombElementOf('table'),
  tr: dombElementOf('tr'),
  td: dombElementOf('td'),
  inputText: function (...modifiers: IModifier<DombHtmlInputText>[]) {
    return new DombHtmlInputText(modifiers);
  },
  inputCheckbox: function (...modifiers: IModifier<DombHtmlInputCheckbox>[]) {
    return new DombHtmlInputCheckbox(modifiers);
  },
  inputSubmit: function (...modifiers: IModifier<DombHtmlInputSubmit>[]) {
    return new DombHtmlInputSubmit(modifiers);
  }
}

function dombElementOf<K extends keyof HTMLElementTagNameMap>(tagName: K): (...modifiers: IModifier<DombDynamicHtmlElement<K>>[]) => DombDynamicHtmlElement<K> {
  return function (...modifiers) {
    return new DombDynamicHtmlElement<K>(tagName, modifiers);
  }
}
