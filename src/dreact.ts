import { IListener, IVal, IUnsubscribe } from "./var";
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

  constructor(private parentContext: IDNodeContext, private index: number) { }

  appendRootNode(node: HTMLElement) {
    this.rootNode = node;
    this.parentContext.appendDomNode(node, this.index);
  }

  watch<T>(v: IVal<T>, listener: IListener<T>): IUnsubscribe {
    const unsubFn = v.watch(listener);
    this.subscriptions.push(unsubFn);
    return () => {
      removeFromArray(this.subscriptions, unsubFn);
      unsubFn();
    }
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
      console.log(`watch ${newText}`);
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

class IfNode extends DNode {
  constructor(private condition: IVal<any>, private child: DNode) {
    super();
  }
  mount(context: DNodeContext) {
    let mountedChild: null | MountedDNode = null;
    if (this.condition.value) {
      mountedChild = context.mountChild(this.child, 0);
    }

    context.watch(this.condition, newCondition => {
      if (newCondition) {
        if (!mountedChild) {
          mountedChild = context.mountChild(this.child, 0);
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

export function Button(text: string, onClick: () => void): DNode {
  return new ButtonNode(text, onClick);
}

export function Div(children: DNode[]): DNode {
  return new DivNode(children);
}

export function If(condition: IVal<any>, child: DNode): DNode {
  return new IfNode(condition, child);
}

export function mount(tree: DNode, rootElement: HTMLElement) {
  const rootContext: IDNodeContext = { appendDomNode: node => rootElement.appendChild(node) };
  tree.mount(new DNodeContext(rootContext, 0));
}
