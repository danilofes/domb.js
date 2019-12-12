import { DNode, MountedDNode, DNodeContext } from "./DNode";
import { IVal, IVals } from "../vars/vars";

export class RepeatNode<T> implements DNode {
  constructor(private children: IVals<T>, private nodeBuilder: (item: T, index: IVal<number>) => DNode) { }

  mount(context: DNodeContext) {
    const startNode = context.appendNode(document.createComment('Repeat start'));
    const endNode = context.appendNode(document.createComment('Repeat end'));

    let mountedChild: MountedDNode[] = [];
    for (let i = 0; i < this.children.items.length; i++) {
      const item = this.children.items[i];
      mountedChild.push(context.mountChild(this.nodeBuilder(item, this.children.indexVal(i)), context.parentElement, endNode));
    }
    context.addUndo(this.children.watch(diff => {
      for (const op of diff.operations) {
        if (op.type === 'add') {
          const position = op.index < mountedChild.length ? mountedChild[op.index].mainNode : null;
          const newNode = context.mountChild(this.nodeBuilder(op.item, this.children.indexVal(op.index)), context.parentElement, position);
          mountedChild.splice(op.index, 0, newNode);
        } else if (op.type === 'remove') {
          mountedChild[op.index].unmount();
          mountedChild.splice(op.index, 1);
        }
      }
    }));
    return context.end(startNode);
  }
}