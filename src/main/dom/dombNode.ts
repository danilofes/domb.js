import { SimpleScope } from '../state';

type NodeStatus = 'unmounted' | 'mounted' | 'destroyed';

export abstract class DombNode<N extends Node = Node> extends SimpleScope implements IModifier<DombNode> {
  protected parent: DombNode | null = null;
  protected status: NodeStatus = 'unmounted';
  private _children: DombNode[] = [];
  private _domNode: N;

  constructor(node: N) {
    super();
    this._domNode = node;
  }

  get domNode(): N {
    return this._domNode;
  };

  addChild(child: DombNode, beforeNode?: Node) {
    if (!this.acceptsChild(child)) {
      throw new Error(`This node cannot accept children`);
    }
    this._children.push(child);
    child.parent = this;
    if (this.status === 'mounted') {
      this.mountChild(child, beforeNode);
    }
  }

  removeChild(child: DombNode, beforeNode?: Node) {
    const idx = this._children.indexOf(child);
    if (idx !== -1) {
      if (this.status !== 'unmounted') {
        this.unmountChild(child);
      }
      this._children.splice(idx, 1);
      child.parent = null;
    }
  }

  private mountChild(child: DombNode, beforeNode?: Node) {
    if (child.status === 'unmounted') {
      this.domNode.insertBefore(child.domNode, beforeNode ?? null);
      child.status = 'mounted';
      child.onMount();
    }
  }

  private unmountChild(child: DombNode): void {
    if (child.status === 'mounted') {
      child.onDestroy();
      this.domNode.removeChild(child.domNode);
      child.status = 'destroyed';
    }
  }

  abstract acceptsChild(childNode: DombNode): boolean;

  protected onMount(): void {
    for (let i = 0; i < this._children.length; i++) {
      this.mountChild(this._children[i]);
    }
  }

  protected onDestroy(): void {
    this.removeChildren();
    this.unsubscribeAll();
  }

  private removeChildren(): void {
    for (let i = this._children.length - 1; i >= 0; i--) {
      this.removeChild(this._children[i]);
    }
  }

  destroy() {
    if (this.parent !== null) {
      throw new Error(`Domb nodes with a parent should call parent.unmountChild(node)`);
    } else {
      this.status = 'destroyed';
      this.onDestroy();
    }
  }

  applyToNode(dombNode: DombNode): void {
    dombNode.addChild(this);
  }
}

export interface IModifier<T extends DombNode> {
  applyToNode(dombNode: T): void;
}
