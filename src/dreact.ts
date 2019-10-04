import { IVar } from "./var";


interface IDNodeContext {
  appendDomNode(node: Node): void;
}

var nodeCounter = 0;

class DNodeContext implements IDNodeContext {
  private nid: number = ++nodeCounter;
  private rootNode: HTMLElement | null = null;
  private mountedChildren: MountedDNode[] = [];

  constructor(private parentContext: IDNodeContext) { }

  appendRootNode(node: HTMLElement) {
    this.rootNode = node;
    this.parentContext.appendDomNode(node);
  }

  appendDomNode(node: Node) {
    if (this.rootNode) {
      this.rootNode.appendChild(node);
    } else {
      this.parentContext.appendDomNode(node);
    }
  }

  unmount() {
    console.log(`node ${this.nid} unmount child ${this.mountedChildren.length}`);
    for (const child of this.mountedChildren) {
      child.unmount();
    }
    if (this.rootNode) {
      console.log(`node ${this.nid} remove rootNode`);
      this.rootNode.remove();
      this.rootNode = null;
    }
  }

  mountChild(child: DNode): MountedDNode {
    const mountedChild = child.mount(new DNodeContext(this));
    this.mountedChildren.push(mountedChild);
    console.log(`node ${this.nid} mountChild ${this.mountedChildren.length}`);
    return mountedChild;
  }

  end(): MountedDNode {
    return this;
  }
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
  constructor(private varText: IVar<string>) {
    super();
  }
  mount(context: DNodeContext) {
    const spanNode = document.createElement('span');
    const textNode = document.createTextNode(this.varText.value);
    spanNode.appendChild(textNode);
    context.appendRootNode(spanNode);
    this.varText.watch(newText => {
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
    for (const child of this.children) {
      context.mountChild(child);
    }
    return context.end();
  }
}

class IfNode extends DNode {
  constructor(private condition: IVar<any>, private child: DNode) {
    super();
  }
  mount(context: DNodeContext) {
    var mountedChild: null | MountedDNode = null;
    if (this.condition.value) {
      mountedChild = context.mountChild(this.child);
    }

    this.condition.watch(newCondition => {
      if (newCondition) {
        if (!mountedChild) {
          mountedChild = context.mountChild(this.child);
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


export function Text(text: IVar<string>): DNode {
  return new TextNode(text);
}

export function Button(text: string, onClick: () => void): DNode {
  return new ButtonNode(text, onClick);
}

export function Div(children: DNode[]): DNode {
  return new DivNode(children);
}

export function If(condition: IVar<any>, child: DNode): DNode {
  return new IfNode(condition, child);
}

export function mount(tree: DNode, rootElement: HTMLElement) {
  const rootContext: IDNodeContext = { appendDomNode: node => rootElement.appendChild(node) };
  tree.mount(new DNodeContext(rootContext));
}
