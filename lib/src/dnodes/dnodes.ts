import { IVal, IVar, Val, IVars } from "../vars/vars";
import { DNode, DNodeContext } from "./DNode";
import { TextNode } from "./TextNode";
import { ElementNode, InputNode } from "./ElementNode";
import { IfNode } from "./IfNode";
import { ForEachNode } from "./ForEachNode";
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

export function If<T>(condition: IVal<T>, thenChild: DNode, elseChild?: DNode): DNode {
  return new IfNode<T>(condition, thenChild, elseChild);
}

export function ForEach<T>(vars: IVars<T>, nodeBuilder: (item: IVar<T>, index: IVal<number>) => DNode): DNode {
  return new ForEachNode(vars, nodeBuilder);
}

export function Repeat<T>(vals: IVal<T[]>, nodeBuilder: (item: IVal<T>, index: number) => DNode): DNode {
  return new RepeatNode(vals, nodeBuilder);
}

export function mount(tree: DNode, rootElement: HTMLElement) {
  tree.mount(new DNodeContext(rootElement, null));
}
