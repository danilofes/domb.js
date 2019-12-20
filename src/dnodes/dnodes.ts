import { IVal, IVar, Val, IVars } from "../vars/vars";
import { DNode, DNodeContext } from "./DNode";
import { TextNode } from "./TextNode";
import { ElementNode, InputNode } from "./ElementNode";
import { IfNode } from "./IfNode";
import { RepeatNode } from "./RepeatNode";

export { DNode, DNodeContext };

export function Text(text: IVal<string> | string): DNode {
  return new TextNode(typeof text === 'string' ? Val(text) : text);
}

export function Input(inputType: string): InputNode {
  return new InputNode().attributes({ 'type': inputType });
}

export function El<K extends keyof HTMLElementTagNameMap>(tagName: K): ElementNode<K> {
  return new ElementNode(tagName);
}

export function If(condition: IVal<any>, thenChild: DNode, elseChild?: DNode): DNode {
  return new IfNode(condition, thenChild, elseChild);
}

export function Repeat<T>(vars: IVars<T>, nodeBuilder: (item: IVar<T>, index: IVal<number>) => DNode): DNode {
  return new RepeatNode(vars, nodeBuilder);
}

export function mount(tree: DNode, rootElement: HTMLElement) {
  tree.mount(new DNodeContext(rootElement, null));
}
