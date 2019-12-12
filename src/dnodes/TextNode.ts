import { DNode, DNodeContext } from "./DNode";
import { IVal } from "../vars/vars";

export class TextNode implements DNode {
  constructor(private varText: IVal<string>) { }

  mount(context: DNodeContext) {
    const textNode = document.createTextNode(this.varText.value);
    context.addUndo(this.varText.watch(newText => {
      textNode.textContent = newText;
    }));
    context.appendNode(textNode);

    return context.end(textNode);
  }
}