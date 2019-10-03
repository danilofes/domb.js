import { IVar } from "./var";

export interface DreactNode<T = any> {
  render(data: T): Node,
  data: T,
};

function renderText(text: string): Node {
  return document.createTextNode(text);
}

function text(text: string): DreactNode<string> {
  return { data: text, render: renderText };
}


function renderButton(props: IButtonProps): Node {
  const button = document.createElement('button');
  button.textContent = props.text;
  button.onclick = props.onClick;
  return button;
}

export interface IButtonProps {
  text: string,
  onClick: () => void
}

export function button(props: IButtonProps): DreactNode<IButtonProps> {
  return { data: props, render: renderButton };
}

function renderVarText(varText: IVar<string>): Node {
  const textNode = document.createTextNode(varText.value);
  varText.watch(newText => {
    textNode.textContent = newText;
  });
  return textNode;
}

export function varText(varText: IVar<string>): DreactNode<IVar<string>> {
  return { data: varText, render: renderVarText };
}

function renderDiv(children: DreactNode<any>[]): Node {
  const div = document.createElement('div');
  for (const child of children) {
    render(child, div);
  }
  return div;
}

export function div(children: DreactNode<any>[]): DreactNode<DreactNode<any>[]> {
  return { data: children, render: renderDiv };
}

export function render(tree: DreactNode<any>, rootElement: HTMLElement) {
  rootElement.appendChild(tree.render(tree.data));
}
