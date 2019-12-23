import { DNode, MountedDNode, DNodeContext } from "./DNode";
import { IVal, Var } from "../vars/vars";
import { SimpleVar } from "../vars/SimpleVar";


interface ChildEntry<T> {
  item: SimpleVar<T>,
  mountedNode: MountedDNode
}

export class RepeatNode2<T> implements DNode {
  constructor(private items: IVal<T[]>, private nodeBuilder: (item: IVal<T>, index: number) => DNode) { }

  mount(context: DNodeContext) {
    const startNode = context.appendNode(document.createComment('Repeat start'));
    const endNode = context.appendNode(document.createComment('Repeat end'));

    let children: ChildEntry<T>[] = [];
    const itemsArray = this.items.value;
    for (let i = 0; i < itemsArray.length; i++) {
      const item = Var(itemsArray[i]);
      const mountedNode = context.mountChild(this.nodeBuilder(item, i), context.parentElement, endNode);
      children.push({ item, mountedNode });
    }

    context.addUndo(this.items.watch(newItems => {
      const commonLen = Math.min(children.length, newItems.length);

      for (let i = 0; i < commonLen; i++) {
        children[i].item.setValue(newItems[i]);
      }
      if (newItems.length > children.length) {
        for (let i = commonLen; i < newItems.length; i++) {
          const item = Var(newItems[i]);
          const mountedNode = context.mountChild(this.nodeBuilder(item, i), context.parentElement, endNode);
          children.push({ item, mountedNode });
        }
      } else if (newItems.length < children.length) {
        const deletedEntries = children.splice(commonLen, children.length - commonLen);
        for (let entry of deletedEntries) {
          entry.mountedNode.unmount();
        }
      }

    }));
    return context.end(startNode);
  }
}