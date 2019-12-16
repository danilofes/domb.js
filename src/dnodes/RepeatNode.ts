import { DNode, MountedDNode, DNodeContext } from "./DNode";
import { IVal, IVals, IVar } from "../vars/vars";

export class RepeatNode<T> implements DNode {
  constructor(private children: IVals<T>, private nodeBuilder: (item: IVar<T>, index: IVal<number>) => DNode) { }

  mount(context: DNodeContext) {
    const startNode = context.appendNode(document.createComment('Repeat start'));
    const endNode = context.appendNode(document.createComment('Repeat end'));

    let mountedChild: MountedDNode[] = [];
    this.children.forEach((item, index) => {
      mountedChild.push(context.mountChild(this.nodeBuilder(item, index), context.parentElement, endNode));
    });

    context.addUndo(this.children.watchArray(diff => {
      for (const op of diff.operations) {
        if (op.type === 'add') {
          const position = op.index < mountedChild.length ? mountedChild[op.index].mainNode : null;
          const newNode = context.mountChild(this.nodeBuilder(this.children.itemAt(op.index), this.children.indexValAt(op.index)), context.parentElement, position);
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