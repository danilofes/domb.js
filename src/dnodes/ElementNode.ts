import { DNode, DNodeContext } from "./DNode";
import { IVal, IVar, Val } from "../vars/vars";
import { TextNode } from "./TextNode";

export class ElementNode<K extends keyof HTMLElementTagNameMap> implements DNode {
  private attrs: { [key: string]: IVal<string | boolean> | string | boolean } = {};
  private childr: DNode[] = [];
  private eventListeners: { [key: string]: (this: HTMLObjectElement, ev: any) => any } = {};
  private optionalClasses: { [key: string]: IVal<boolean> } = {};

  constructor(private elementType: K, private cssClasses?: string) { }

  mount(context: DNodeContext) {
    const el = document.createElement(this.elementType);
    if (this.cssClasses) {
      el.className = this.cssClasses;
    }

    for (const className in this.optionalClasses) {
      context.bindElementClass(el, className, this.optionalClasses[className]);
    }

    for (const attributeKey in this.attrs) {
      context.bindElementAttribute(el, attributeKey, this.attrs[attributeKey]);
    }

    for (const eventKey in this.eventListeners) {
      el.addEventListener(eventKey, this.eventListeners[eventKey]);
    }

    this.onMountElement(context, el);
    context.appendNode(el);

    for (let i = 0; i < this.childr.length; i++) {
      const child = this.childr[i];
      context.mountChild(child, el, null);
    }

    return context.end(el);
  }

  onMountElement(context: DNodeContext, el: HTMLElementTagNameMap[K]) {
    // subclasses may override
  }

  attributes(attrs: { [key: string]: IVal<string | boolean> | string | boolean }) {
    for (const attributeKey in attrs) {
      this.attrs[attributeKey] = attrs[attributeKey];
    }
    return this;
  }

  children(...nodes: DNode[]) {
    this.childr = nodes;
    return this;
  }

  text(text: IVal<string>): this
  text(text: string): this
  text(text: IVal<string> | string) {
    this.childr = [new TextNode(typeof text === 'string' ? Val(text) : text)];
    return this;
  }

  on<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLObjectElement, ev: HTMLElementEventMap[K]) => any) {
    this.eventListeners[type] = listener;
    return this;
  }
}

export class InputNode extends ElementNode<'input'> {
  private valueVar?: IVar<string>;
  private checkedVar?: IVar<boolean>;

  constructor() {
    super('input');
  }

  onMountElement(context: DNodeContext, el: HTMLInputElement) {
    if (this.valueVar) {
      el.value = this.valueVar.value;
      context.addUndo(this.valueVar.watch(newValue => {
        el.value = newValue;
      }));
      el.addEventListener('input', () => {
        this.valueVar!.setValue(el.value);
      });
    }

    if (this.checkedVar) {
      el.checked = this.checkedVar.value;
      context.addUndo(this.checkedVar.watch(newValue => {
        el.checked = newValue;
      }));
      el.addEventListener('input', () => {
        this.checkedVar!.setValue(el.checked);
      });
    }
  }

  bindValue(valueVar: IVar<string>): this {
    this.valueVar = valueVar;
    return this;
  }

  bindChecked(checkedVar: IVar<boolean>): this {
    this.checkedVar = checkedVar;
    return this;
  }

}

