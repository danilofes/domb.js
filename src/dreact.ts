import { IVar } from "./var";


export abstract class DNode {
  abstract mount(appendNode: (node: Node) => void): void;
}

class Button extends DNode {
  constructor(private text: string, private onClick: () => void) {
    super();
  }
  mount(appendNode: (node: Node) => void) {
    const button = document.createElement('button');
    button.textContent = this.text;
    button.onclick = this.onClick;
    appendNode(button);
  }
}

class Text extends DNode {
  constructor(private varText: IVar<string>) {
    super();
  }
  mount(appendNode: (node: Node) => void) {
    const textNode = document.createTextNode(this.varText.value);
    this.varText.watch(newText => {
      textNode.textContent = newText;
    });
    appendNode(textNode);
  }
}


class Div extends DNode {
  constructor(private children: DNode[]) {
    super();
  }
  mount(appendNode: (node: Node) => void) {
    const div = document.createElement('div');
    for (const child of this.children) {
      child.mount(node => div.appendChild(node));
    }
    return appendNode(div);
  }
}


export function text(text: IVar<string>): DNode {
  return new Text(text);
}

export function button(text: string, onClick: () => void): DNode {
  return new Button(text, onClick);
}

export function div(children: DNode[]): DNode {
  return new Div(children);
}


export function mount(tree: DNode, rootElement: HTMLElement) {
  tree.mount(node => rootElement.appendChild(node))
}
