import { IUnsubscribe } from '../vars/vars';
import { DombDynamicHtmlElement } from './dombHtmlElement';
import { IModifier } from './dombNode';
import { bindDomEvent } from './eventHandlerModifier';

export interface INodeWithModel<V> {
  setModelValue(value: V): void;
  onModelValueChange(callback: (newV: V) => void): IUnsubscribe;
}

export class DombHtmlInputText extends DombDynamicHtmlElement<"input"> implements INodeWithModel<string> {
  constructor(modifiers: IModifier<DombHtmlInputText>[]) {
    super("input", modifiers);
    this.domNode.type = "text";
  }

  setModelValue(value: string): void {
    this.domNode.value = value;
  }

  onModelValueChange(callback: (newV: string) => void): IUnsubscribe {
    return bindDomEvent(this, this.domNode, "input", () => callback(this.domNode.value));
  }
}

export class DombHtmlInputCheckbox extends DombDynamicHtmlElement<"input"> implements INodeWithModel<boolean> {
  constructor(modifiers: IModifier<DombHtmlInputCheckbox>[]) {
    super("input", modifiers);
    this.domNode.type = "checkbox";
  }

  setModelValue(value: boolean): void {
    this.domNode.checked = value;
  }

  onModelValueChange(callback: (newV: boolean) => void): IUnsubscribe {
    return bindDomEvent(this, this.domNode, "click", () => callback(this.domNode.checked));
  }
}

export class DombHtmlInputSubmit extends DombDynamicHtmlElement<"input"> {
  constructor(modifiers: IModifier<DombHtmlInputSubmit>[]) {
    super("input", modifiers);
    this.domNode.type = "submit";
  }
}
