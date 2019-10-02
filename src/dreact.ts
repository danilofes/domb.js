
export interface DreactNode<T> {
  render(data: T): Node,
  data: T,
};

function renderText(text: string): Node {
  return document.createTextNode(text);
}

function text(text: string): DreactNode<string> {
  return { data: text, render: renderText };
}

function renderVarText(varText: IVar<string>): Node {
  const textNode = document.createTextNode(varText.value);
  varText.watch(newText => {
    textNode.textContent = newText;
  });
  return textNode;
}

function varText(varText: IVar<string>): DreactNode<IVar<string>> {
  return { data: varText, render: renderVarText };
}

function renderDiv(child: DreactNode<any>): Node {
  const div = document.createElement('div');
  render(child, div);
  return div;
}

function div(child: DreactNode<any>): DreactNode<DreactNode<any>> {
  return { data: child, render: renderDiv };
}

export function render(tree: DreactNode<any>, rootElement: HTMLElement) {
  rootElement.appendChild(tree.render(tree.data));
}

type IListener<T> = (newValue: T) => void;

interface IVar<T> {
  value: T,
  setValue: (newValue: T) => void,
  watch: (listener: IListener<T>) => void
}

function Var<T>(value: T): IVar<T> {
  return new SimpleVar<T>(value);
}

class SimpleVar<T> implements IVar<T> {
  private listeners: IListener<T>[];

  constructor(public value: T) {
    this.listeners = [];
  }

  setValue(newValue: T) {
    this.value = newValue;
    for (const l of this.listeners) {
      l(newValue);
    }
  }

  watch(listener: IListener<T>) {
    this.listeners.push(listener);
  }
}

function app(): DreactNode<any> {
  const varName = Var('Danilo');
  varName.setValue('Macaco');

  return div(varText(varName));
}


const rootElement = document.createElement('div');
document.body.appendChild(rootElement);

render(app(), rootElement);
