import { IUnsubscribe } from '../vars/vars';
import { DombDynamicHtmlElement } from './dombHtmlElement';
import { IModifier, INodeWithModel } from './dombNode';
import { prop } from './elementPropertyModifier';
import { bindDomEvent } from './eventHandlerModifier';

export class DombHtmlInputText extends DombDynamicHtmlElement<"input"> implements INodeWithModel<string> {
  constructor(modifiers: IModifier<DombHtmlInputText>[]) {
    super("input", [
      prop("type", "text"),
      ...modifiers
    ]);
  }

  setModelValue(value: string): void {
    this.getDomNode().value = value;
  }

  onModelValueChange(callback: (newV: string) => void): IUnsubscribe {
    return bindDomEvent(this, this.getDomNode(), "input", () => callback(this.getDomNode().value));
  }
}

export class DombHtmlInputCheckbox extends DombDynamicHtmlElement<"input"> implements INodeWithModel<boolean> {
  constructor(modifiers: IModifier<DombHtmlInputCheckbox>[]) {
    super("input", [
      prop("type", "checkbox"),
      ...modifiers
    ]);
  }

  setModelValue(value: boolean): void {
    this.getDomNode().checked = value;
  }

  onModelValueChange(callback: (newV: boolean) => void): IUnsubscribe {
    return bindDomEvent(this, this.getDomNode(), "click", () => callback(this.getDomNode().checked));
  }
}

export class DombHtmlInputSubmit extends DombDynamicHtmlElement<"input"> {
  constructor(modifiers: IModifier<DombHtmlInputSubmit>[]) {
    super("input", [
      prop("type", "submit"),
      ...modifiers
    ]);
  }
}
