import { DNode, DNodeContext } from "./DNode";
import { IVal, IVar, Val } from "../vars/vars";
import { TextNode } from "./TextNode";

export class ElementNode implements DNode {
  private attrs: { [key: string]: IVal<string | boolean> | string | boolean } = {};
  private childr: DNode[] = [];
  private eventListeners: { [key: string]: (this: HTMLObjectElement, ev: any) => any } = {};
  private optionalClasses: { [key: string]: IVal<boolean> } = {};

  constructor(private elementType: keyof HTMLElementTagNameMap, private cssClasses?: string) { }

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

    context.appendNode(el);
    for (let i = 0; i < this.childr.length; i++) {
      const child = this.childr[i];
      context.mountChild(child, el, null);
    }
    return context.end(el);
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

  text(text: IVal<string>): ElementNode
  text(text: string): ElementNode
  text(text: IVal<string> | string) {
    this.childr = [new TextNode(typeof text === 'string' ? Val(text) : text)];
    return this;
  }

  on<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLObjectElement, ev: HTMLElementEventMap[K]) => any) {
    this.eventListeners[type] = listener;
    return this;
  }
}

export class TextInputNode implements DNode {
  constructor(private value: IVar<string>) { }

  mount(context: DNodeContext) {
    const input = document.createElement('input');
    input.type = 'text';
    input.oninput = event => {
      const newValue = input.value;
      this.value.setValue(newValue);
    }
    context.bindInputValue(input, this.value);
    context.appendNode(input);
    return context.end(input);
  }
}
