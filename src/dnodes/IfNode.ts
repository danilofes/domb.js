import { DNode, MountedDNode, DNodeContext } from "./DNode";
import { IVal } from "../vars/vars";

export class IfNode implements DNode {
  constructor(private condition: IVal<any>, private child: DNode) { }

  mount(context: DNodeContext) {
    const placeholderNode = context.appendNode(document.createComment('If disabled'));
    let mountedChild: null | MountedDNode = null;
    const child = this.child;

    toggleChild(this.condition.value);
    context.addUndo(this.condition.watch(toggleChild));

    return context.end(placeholderNode);

    function toggleChild(conditionValue: boolean) {
      if (conditionValue) {
        if (!mountedChild) {
          mountedChild = context.mountChild(child, context.parentElement, placeholderNode.nextSibling);
          placeholderNode.textContent = 'If enabled';
        }
      } else {
        if (mountedChild) {
          mountedChild.unmount();
          mountedChild = null;
          placeholderNode.textContent = 'If disabled';
        }
      }
    }
  }
}