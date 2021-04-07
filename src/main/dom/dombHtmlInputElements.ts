import { IState } from '../state';
import { IUnsubscribe } from '../vars/vars';
import { DombDynamicHtmlElement, ElementConfig } from './dombHtmlElement';

export interface INodeWithModel<V> {
  setModelValue(value: V): void;
  onModelValueChange(callback: (newV: V) => void): IUnsubscribe;
}

export type ElementConfigWithModel<E extends HTMLElement, V> = ElementConfig<E> & { model?: IState<V> };

export abstract class DombHtmlInput<V> extends DombDynamicHtmlElement<"input", ElementConfigWithModel<HTMLInputElement, V>> {
  constructor() {
    super("input");
  }
  abstract setModelValue(value: V): void;
  abstract onModelValueChange(callback: (newV: V) => void): IUnsubscribe;

  protected applyConfig(config: ElementConfig<HTMLInputElement> & { model: IState<V> }): void {
    const { model, ...rest } = config;
    if (model) {
      model.bind(this, v => {
        this.setModelValue(v);
      });
      this.onModelValueChange((newV: V) => {
        model.setValue(newV);
      });
    }
    super.applyConfig(rest);
  }
}

export class DombHtmlInputText extends DombHtmlInput<string> {
  constructor() {
    super();
    this.domNode.type = "text";
  }

  setModelValue(value: string): void {
    this.domNode.value = value;
  }

  onModelValueChange(callback: (newV: string) => void): IUnsubscribe {
    return this.on("input", () => callback(this.domNode.value));
  }
}

export class DombHtmlInputCheckbox extends DombHtmlInput<boolean> {
  constructor() {
    super();
    this.domNode.type = "checkbox";
  }

  setModelValue(value: boolean): void {
    this.domNode.checked = value;
  }

  onModelValueChange(callback: (newV: boolean) => void): IUnsubscribe {
    return this.on("click", () => callback(this.domNode.checked));
  }
}

export class DombHtmlInputSubmit extends DombDynamicHtmlElement<"input"> {
  constructor() {
    super("input");
    this.domNode.type = "submit";
  }
}
