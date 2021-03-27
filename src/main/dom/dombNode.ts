import { SimpleScope } from '../state';

type NodeStatus = 'unmounted' | 'mounted' | 'destroyed';

export abstract class DombNode<N extends Node = Node> extends SimpleScope implements IModifier<DombNode> {
  private parent: DombNode | null = null;
  protected status: NodeStatus = 'unmounted';
  private childrenArray: DombNode[] = [];
  private domNode: N;

  constructor(node: N) {
    super();
    this.domNode = node;
  }

  protected getParent(): DombNode | null {
    if (this.status !== 'mounted') {
      throw new Error(`Cannot get parent of ${this.status} node`);
    }
    return this.parent;
  }

  getDomNode(): N {
    return this.domNode;
  };

  mountChild(child: DombNode, beforeNode?: Node) {
    if (!this.acceptsChild(child)) {
      throw new Error(`This node cannot accept children`);
    }
    this.getDomNode().insertBefore(child.getDomNode(), beforeNode ?? null);
    child.parent = this;
    child.status = 'mounted';
    this.childrenArray.push(child);
    child.onMount();
  }

  unmountChild(dombNode: DombNode): void {
    const idx = this.childrenArray.indexOf(dombNode);
    if (idx !== -1) {
      dombNode.onDestroy();
      dombNode.destroySelf();
      dombNode.parent = null;
      dombNode.status = 'destroyed';
      this.childrenArray.splice(idx, 1);
      this.getDomNode().removeChild(dombNode.getDomNode());
    }
  }

  abstract acceptsChild(childNode: DombNode): boolean;

  protected onMount(): void {
    // 
  }

  protected onDestroy(): void {
    // 
  }

  private destroySelf(): void {
    for (let i = this.childrenArray.length - 1; i >= 0; i--) {
      this.unmountChild(this.childrenArray[i]);
    }
    this.unsubscribeAll();
  }

  destroy() {
    if (this.parent !== null) {
      throw new Error(`Domb nodes with a parent should call parent.unmountChild(node)`);
    } else {
      this.destroySelf();
      this.status = 'destroyed';
    }
  }

  applyToNode(dombNode: DombNode): void {
    dombNode.mountChild(this);
  }
}

export interface IModifier<T extends DombNode> {
  applyToNode(dombNode: T): void;
}
