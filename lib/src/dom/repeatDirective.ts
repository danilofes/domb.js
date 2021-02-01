import { IState } from '../state';
import { IDombNode, AbstractDombNode } from './dombNode';

export class RepeatDirective<T> extends AbstractDombNode<Comment> {

  mountedNodes: IDombNode[] = [];

  constructor(private values: IState<T[]>, private buildItem: (itemAtIndex: IState<T>, index: number) => IDombNode) {
    super(document.createComment('repeat node'));
  }

  onMount() {
    this.values.$.length.bind(this, this.toggleNodes.bind(this));
  }

  toggleNodes(numItems: number) {
    for (let i = numItems; i < this.mountedNodes.length; i++) {
      this.getParent().unmountChild(this.mountedNodes[i]);
    }
    if (numItems < this.mountedNodes.length) {
      this.mountedNodes.splice(numItems, this.mountedNodes.length - numItems);
    }
    for (let i = this.mountedNodes.length; i < numItems; i++) {
      const newItem = this.buildItem(this.values.$[i], i);
      this.getParent().mountChild(newItem, this.getDomNode());
      this.mountedNodes.push(newItem);
    }
  }

  destroySelf() {
    this.toggleNodes(0);
    super.destroySelf();
  }
}

export function $repeat<T>(values: IState<T[]>, buildItem: (itemAtIndex: IState<T>, index: number) => IDombNode) {
  return new RepeatDirective<T>(values, buildItem);
}
