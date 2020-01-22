import { DNode, DNodeContext } from "./DNode";
import { IVal, IVar, Val } from "../vars/vars";
import { TextNode } from "./TextNode";

export class ElementNode<K extends keyof HTMLElementTagNameMap> implements DNode {
  private attrs: { [key: string]: IVal<string | boolean> | string | boolean } = {};
  private props: { [key: string]: IVal<any> | any } = {};
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

    for (const propKey in this.props) {
      context.bindElementProperty(el, propKey, this.props[propKey]);
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

  protected onMountElement(context: DNodeContext, el: HTMLElementTagNameMap[K]) {
    // subclasses may override
  }

  attributes(attrs: { [key: string]: IVal<string | boolean> | string | boolean }) {
    Object.assign(this.attrs, attrs);
    return this;
  }

  property<P extends string & keyof HTMLElementTagNameMap[K]>(key: P, v: IVal<HTMLElementTagNameMap[K][P]> | HTMLElementTagNameMap[K][P]) {
    this.props[key] = v;
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
  constructor() {
    super('input');
  }

  value(valueVar: IVar<string>): this {
    this.property('value', valueVar);
    this.on('input', ev => {
      valueVar.setValue((ev.currentTarget as HTMLInputElement).value);
    });
    return this;
  }

  checked(checkedVar: IVar<boolean>): this;
  checked(checkedVar: IVal<boolean>, setValue: (newValue: boolean) => void): this;
  checked(checkedVar: IVar<boolean> | IVal<boolean>, setValue?: (newValue: boolean) => void): this {
    this.property('checked', checkedVar);
    if (setValue) {
      this.on('click', ev => {
        setValue((ev.currentTarget as HTMLInputElement).checked);
      });
    } else if ('setValue' in checkedVar) {
      this.on('click', ev => {
        checkedVar.setValue((ev.currentTarget as HTMLInputElement).checked);
      });
    }
    return this;
  }

}

