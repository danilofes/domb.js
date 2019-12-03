import { IListener, IVal, IUnsubscribe, IVar, IVals } from "./var";
import { removeFromArray } from "./util";


interface IDNodeContext {
  appendDomNode(node: Element, order: number): void;
}

let nodeCounter = 0;

class DNodeContext implements IDNodeContext {
  private nid: number = ++nodeCounter;
  private rootNode: HTMLElement | null = null;
  private mountedChildren: MountedDNode[] = [];
  private subscriptions: IUnsubscribe[] = [];

  constructor(private parentContext: IDNodeContext, public readonly index: number) { }

  appendRootNode(node: HTMLElement) {
    this.rootNode = node;
    this.parentContext.appendDomNode(node, this.index);
  }

  addSubscription<T>(unsubFn: IUnsubscribe): IUnsubscribe {
    this.subscriptions.push(unsubFn);
    return () => {
      removeFromArray(this.subscriptions, unsubFn);
      unsubFn();
    }
  }

  watch<T>(v: IVal<T>, listener: IListener<T>): IUnsubscribe {
    return this.addSubscription(v.watch(listener));
  }

  appendDomNode(node: Element, order: number) {
    if (this.rootNode) {
      appendNodeAt(this.rootNode, node, order);
    } else {
      this.parentContext.appendDomNode(node, order);
    }
  }

  unmount() {
    for (const unsubscribe of this.subscriptions) {
      unsubscribe();
    }
    for (const child of this.mountedChildren) {
      child.unmount();
    }
    if (this.rootNode) {
      this.rootNode.remove();
      this.rootNode = null;
    }
  }

  mountChild(child: DNode, index: number): MountedDNode {
    const mountedChild = child.mount(new DNodeContext(this, index));
    this.mountedChildren.push(mountedChild);
    //console.log(`node ${this.nid} mountChild ${this.mountedChildren.length}`);
    return mountedChild;
  }

  end(): MountedDNode {
    return this;
  }
}

function appendNodeAt(parent: Element, child: Element, order: number) {
  const children = parent.children;
  child.setAttribute('order', String(order));
  for (let i = 0; i < children.length; i++) {
    const elem = children[i];
    const orderI = elem.getAttribute('order');
    if (orderI && parseInt(orderI) > order) {
      parent.insertBefore(child, elem);
      return;
    }
  }
  parent.appendChild(child);
}

interface MountedDNode {
  unmount(): void
}

export abstract class DNode {
  abstract mount(context: DNodeContext): MountedDNode;
}

class ButtonNode extends DNode {
  constructor(private text: string, private onClick: () => void) {
    super();
  }
  mount(context: DNodeContext) {
    const button = document.createElement('button');
    button.textContent = this.text;
    button.onclick = this.onClick;
    context.appendRootNode(button);
    return context.end();
  }
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
    context.watch(this.value, newValue => {
      input.value = newValue;
    });
    context.appendRootNode(input);
    return context.end();
  }

  onInput(e: Event) {
    console.log(e.target);
  }
}


class TextNode extends DNode {
  constructor(private varText: IVal<string>) {
    super();
  }
  mount(context: DNodeContext) {
    const spanNode = document.createElement('span');
    const textNode = document.createTextNode(this.varText.value);
    spanNode.appendChild(textNode);
    context.appendRootNode(spanNode);
    context.watch(this.varText, newText => {
      textNode.textContent = newText;
    });
    return context.end();
  }
}


class DivNode extends DNode {
  constructor(private children: DNode[]) {
    super();
  }
  mount(context: DNodeContext) {
    const div = document.createElement('div');
    context.appendRootNode(div);
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      context.mountChild(child, i);
    }
    return context.end();
  }
}

class RepeatNode<T> extends DNode {
  constructor(private children: IVals<T>, private nodeBuilder: (item: T, index: IVal<number>) => DNode) {
    super();
  }
  mount(context: DNodeContext) {
    let mountedChild: MountedDNode[] = [];
    for (let i = 0; i < this.children.items.length; i++) {
      const item = this.children.items[i];
      mountedChild.push(context.mountChild(this.nodeBuilder(item, this.children.indexVal(i)), i));
    }
    context.addSubscription(this.children.watch(diff => {
      for (const op of diff.operations) {
        if (op.type === 'add') {
          const newNode = context.mountChild(this.nodeBuilder(op.item, this.children.indexVal(op.index)), op.index);
          mountedChild.splice(op.index, 0, newNode);
        } else if (op.type === 'remove') {
          mountedChild[op.index].unmount();
          mountedChild.splice(op.index, 1);
        }
      }
    }));
    return context.end();
  }
}

class IfNode extends DNode {
  constructor(private condition: IVal<any>, private child: DNode) {
    super();
  }
  mount(context: DNodeContext) {
    let mountedChild: null | MountedDNode = null;
    if (this.condition.value) {
      mountedChild = context.mountChild(this.child, context.index);
    }

    context.watch(this.condition, newCondition => {
      if (newCondition) {
        if (!mountedChild) {
          mountedChild = context.mountChild(this.child, context.index);
        }
      } else {
        if (mountedChild) {
          mountedChild.unmount();
          mountedChild = null;
        }
      }
    });

    return context.end();
  }
}


export function Text(text: IVal<string>): DNode {
  return new TextNode(text);
}

export function TextInput(value: IVar<string>): DNode {
  return new TextInputNode(value);
}

export function Button(text: string, onClick: () => void): DNode {
  return new ButtonNode(text, onClick);
}

export function Div(children: DNode[]): DNode {
  return new DivNode(children);
}

export function If(condition: IVal<any>, child: DNode): DNode {
  return new IfNode(condition, child);
}

export function Repeat<T>(vals: IVals<T>, nodeBuilder: (item: T, index: IVal<number>) => DNode): DNode {
  return new RepeatNode(vals, nodeBuilder);
}

export function mount(tree: DNode, rootElement: HTMLElement) {
  const rootContext: IDNodeContext = { appendDomNode: node => rootElement.appendChild(node) };
  tree.mount(new DNodeContext(rootContext, 0));
}
