import { IListener, IVal, IUnsubscribe, IVar, IVals, noop, Val } from "./var";
import { removeFromArray } from "./util";


let nodeCounter = 0;

class DNodeContext {
  public readonly nid: number = ++nodeCounter;
  private undoList: IUnsubscribe[] = [];

  constructor(public readonly parentElement: HTMLElement, public readonly referenceNode: Node | null, public readonly parent?: DNodeContext) { }

  appendNode<T extends Node>(node: T): T {
    const appendedNode = this.parentElement.insertBefore(node, this.referenceNode);
    this.addUndo(() => { this.parentElement.removeChild(appendedNode) });
    return appendedNode;
  }

  addUndo<T>(unsubFn: IUnsubscribe): IUnsubscribe {
    this.undoList.push(unsubFn);
    return () => {
      removeFromArray(this.undoList, unsubFn);
      unsubFn();
    }
  }

  bindElementAttribute(node: Element, key: string, v: IVal<string | boolean> | string | boolean): IUnsubscribe {
    if (typeof v === 'string' || typeof v === 'boolean') {
      setElementAttribute(node, key, v);
      return noop;
    } else {
      setElementAttribute(node, key, v.value);
      return this.addUndo(v.watch(newValue => setElementAttribute(node, key, newValue)));
    }
  }

  bindElementClass(node: Element, className: string, enabled: IVal<boolean>): IUnsubscribe {
    setElementClass(node, className, enabled.value);
    return this.addUndo(enabled.watch(newValue => setElementClass(node, className, newValue)));
  }

  bindInputValue(input: HTMLInputElement, v: IVal<string>): IUnsubscribe {
    input.value = v.value;
    return this.addUndo(v.watch(newValue => { input.value = newValue; }));
  }

  mountChild(child: DNode, parentElement: HTMLElement, referenceNode: Node | null): MountedDNode {
    return child.mount(new DNodeContext(parentElement, referenceNode, this));
  }

  end(mainNode: Node): MountedDNode {
    const unmountFn = () => {
      for (let i = this.undoList.length - 1; i >= 0; i--) {
        this.undoList[i]();
      }
      this.undoList = [];
    };

    return {
      mainNode,
      unmount: this.parent ? this.parent.addUndo(unmountFn) : unmountFn
    };
  }
}

function setElementAttribute(element: Element, attr: string, value: string | boolean) {
  if (value === false) {
    element.removeAttribute(attr);
  } else if (value === true) {
    element.setAttribute(attr, '');
  } else {
    element.setAttribute(attr, value);
  }
}

function setElementClass(element: Element, className: string, enabled: boolean) {
  if (enabled) {
    element.classList.add(className);
  } else {
    element.classList.remove(className);
  }
}

interface MountedDNode {
  mainNode: Node,
  unmount(): void
}

export abstract class DNode {
  abstract mount(context: DNodeContext): MountedDNode;
}

class TextInputNode extends DNode {
  constructor(private value: IVar<string>) {
    super();
  }
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


class TextNode extends DNode {
  constructor(private varText: IVal<string>) {
    super();
  }
  mount(context: DNodeContext) {
    const textNode = document.createTextNode(this.varText.value);
    context.addUndo(this.varText.watch(newText => {
      textNode.textContent = newText;
    }));
    context.appendNode(textNode);

    return context.end(textNode);
  }
}


class ElementNode extends DNode {
  private attrs: { [key: string]: IVal<string | boolean> | string | boolean } = {};
  private childr: DNode[] = [];
  private eventListeners: { [key: string]: (this: HTMLObjectElement, ev: any) => any } = {};
  private optionalClasses: { [key: string]: IVal<boolean> } = {};

  constructor(private elementType: keyof HTMLElementTagNameMap, private cssClasses?: string) {
    super();
  }

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

  on<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLObjectElement, ev: HTMLElementEventMap[K]) => any) {
    this.eventListeners[type] = listener;
    return this;
  }
}


class RepeatNode<T> extends DNode {
  constructor(private children: IVals<T>, private nodeBuilder: (item: T, index: IVal<number>) => DNode) {
    super();
  }
  mount(context: DNodeContext) {
    const startNode = context.appendNode(document.createComment('Repeat start'));
    const endNode = context.appendNode(document.createComment('Repeat end'));

    let mountedChild: MountedDNode[] = [];
    for (let i = 0; i < this.children.items.length; i++) {
      const item = this.children.items[i];
      mountedChild.push(context.mountChild(this.nodeBuilder(item, this.children.indexVal(i)), context.parentElement, endNode));
    }
    context.addUndo(this.children.watch(diff => {
      for (const op of diff.operations) {
        if (op.type === 'add') {
          const position = op.index < mountedChild.length ? mountedChild[op.index].mainNode : null;
          const newNode = context.mountChild(this.nodeBuilder(op.item, this.children.indexVal(op.index)), context.parentElement, position);
          mountedChild.splice(op.index, 0, newNode);
        } else if (op.type === 'remove') {
          mountedChild[op.index].unmount();
          mountedChild.splice(op.index, 1);
        }
      }
    }));
    return context.end(startNode);
  }
}

class IfNode extends DNode {
  constructor(private condition: IVal<any>, private child: DNode) {
    super();
  }
  mount(context: DNodeContext) {
    const placeholderNode = context.appendNode(document.createComment('If disabled'));
    let mountedChild: null | MountedDNode = null;
    const child = this.child;

    toggleChild(this.condition.value);
    context.addUndo(this.condition.watch(toggleChild));

    return context.end(placeholderNode);

    function toggleChild(conditionValue: boolean) {
      if (conditionValue) {
        if (!mountedChild) {
          mountedChild = context.mountChild(child, context.parentElement, placeholderNode.nextSibling);
          placeholderNode.textContent = 'If enabled';
        }
      } else {
        if (mountedChild) {
          mountedChild.unmount();
          mountedChild = null;
          placeholderNode.textContent = 'If disabled';
        }
      }
    }
  }
}


export function Text(text: IVal<string> | string): DNode {
  return new TextNode(typeof text === 'string' ? Val(text) : text);
}

export function TextInput(value: IVar<string>): DNode {
  return new TextInputNode(value);
}

export function Button(text: string, onClick: () => void): DNode {
  return new ElementNode('button')
    .on('click', onClick)
    .children(Text(text));
}

export function El(tagName: keyof HTMLElementTagNameMap): ElementNode {
  return new ElementNode(tagName);
}

export function If(condition: IVal<any>, child: DNode): DNode {
  return new IfNode(condition, child);
}

export function Repeat<T>(vals: IVals<T>, nodeBuilder: (item: T, index: IVal<number>) => DNode): DNode {
  return new RepeatNode(vals, nodeBuilder);
}

export function mount(tree: DNode, rootElement: HTMLElement) {
  tree.mount(new DNodeContext(rootElement, null));
}
