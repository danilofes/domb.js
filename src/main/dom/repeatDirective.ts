import { IState } from "../state";
import { DombNode } from "./dombNode";

export class RepeatDirective<T> extends DombNode<Comment> {
  mountedNodes: DombNode[] = [];

  constructor(private values: IState<T[]>, private buildItem: (itemAtIndex: IState<T>, index: number) => DombNode) {
    super(document.createComment("repeat node"));
  }

  acceptsChild(childNode: DombNode): boolean {
    return false;
  }

  onMount() {
    super.onMount();
    this.values.$.length.bind(this, this.toggleNodes.bind(this));
  }

  toggleNodes(numItems: number) {
    for (let i = numItems; i < this.mountedNodes.length; i++) {
      this.parent!.removeChild(this.mountedNodes[i]);
    }
    if (numItems < this.mountedNodes.length) {
      this.mountedNodes.splice(numItems, this.mountedNodes.length - numItems);
    }
    for (let i = this.mountedNodes.length; i < numItems; i++) {
      const newItem = this.buildItem(this.values.atIndex(i), i);
      this.parent!.addChild(newItem, this.domNode);
      this.mountedNodes.push(newItem);
    }
  }

  onDestroy() {
    this.toggleNodes(0);
    super.onDestroy();
  }
}

export function $repeat<T>(values: IState<T[]>, buildItem: (itemAtIndex: IState<T>, index: number) => DombNode) {
  return new RepeatDirective<T>(values, buildItem);
}
