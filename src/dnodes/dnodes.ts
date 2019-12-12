import { TextNode } from "./TextNode";
import { IVal, IVar, Val, IVals } from "../vars/vars";
import { DNode, DNodeContext } from "./DNode";
import { ElementNode, TextInputNode } from "./ElementNode";
import { IfNode } from "./IfNode";
import { RepeatNode } from "./RepeatNode";

export { DNode } from "./DNode";

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
