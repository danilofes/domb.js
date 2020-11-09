import { DNode, MountedDNode, DNodeContext } from "./DNode";
import { IVal } from "../vars/vars";

export class IfNode<T> implements DNode {
  constructor(private condition: IVal<T>, private thenChild: DNode, private elseChild?: DNode) { }

  mount(context: DNodeContext) {
    const placeholderNode = context.appendNode(document.createComment('If disabled'));
    let mountedThenChild: null | MountedDNode = null;
    let mountedElseChild: null | MountedDNode = null;
    const { thenChild, elseChild } = this;

    toggleChild(this.condition.value);
    context.addUndo(this.condition.watch(toggleChild));

    return context.end(placeholderNode);

    function toggleChild(conditionValue: T) {
      const value = !!conditionValue;
      if (value) {
        placeholderNode.textContent = 'If enabled';
        if (!mountedThenChild) {
          mountedThenChild = context.mountChild(thenChild, context.parentElement, placeholderNode.nextSibling);
        }
        if (mountedElseChild) {
          mountedElseChild.unmount();
          mountedElseChild = null;
        }
      } else {
        placeholderNode.textContent = 'If disabled';
        if (!mountedElseChild && elseChild) {
          mountedElseChild = context.mountChild(elseChild, context.parentElement, placeholderNode.nextSibling);
        }
        if (mountedThenChild) {
          mountedThenChild.unmount();
          mountedThenChild = null;
        }
      }
    }
  }
}