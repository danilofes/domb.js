import { DNode, MountedDNode, DNodeContext } from "./DNode";
import { IVal, IVals, IVar, forEach, IVars } from "../vars/vars";

export class RepeatNode<T> implements DNode {
  constructor(private items: IVars<T>, private nodeBuilder: (item: IVar<T>, index: IVal<number>) => DNode) { }

  mount(context: DNodeContext) {
    const startNode = context.appendNode(document.createComment('Repeat start'));
    const endNode = context.appendNode(document.createComment('Repeat end'));

    let mountedChild: MountedDNode[] = [];
    for (let i = 0; i < this.items.length.value; i++) {

    }
    forEach(this.items, (item, index) => {
      mountedChild.push(context.mountChild(this.nodeBuilder(item, index), context.parentElement, endNode));
    });

    context.addUndo(this.items.watch({
      onInsert: (index, item) => {
        const position = index < mountedChild.length ? mountedChild[index].mainNode : null;
        const newNode = context.mountChild(this.nodeBuilder(this.items.itemAt(index), this.items.indexValAt(index)), context.parentElement, position);
        mountedChild.splice(index, 0, newNode);
      },
      onDelete: (index, item) => {
        mountedChild[index].unmount();
        mountedChild.splice(index, 1);
      }
    }));

    return context.end(startNode);
  }
}