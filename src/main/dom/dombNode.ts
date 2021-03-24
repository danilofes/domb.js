import { IScope, SimpleScope } from '../state';
import { IUnsubscribe } from '../vars/vars';

export interface IDombNode<N extends Node = Node> extends IScope {
  getDomNode(): N;
  destroySelf(): void;
  init(parent: INonVoidDombNode): void;
  onMount(): void;
}

export interface INonVoidDombNode<N extends Node = Node> extends IDombNode<N> {
  mountChild(child: IDombNode, beforeNode?: Node): void;
  unmountChild(child: IDombNode): void;
}

export interface IModifier<N extends IDombNode> {
  applyToNode(dombNode: N): void;
}

export interface INodeWithModel<V> extends IDombNode {
  setModelValue(value: V): void;

  onModelValueChange(callback: (newV: V) => void): IUnsubscribe;
}

export abstract class AbstractDombNode<N extends Node> extends SimpleScope implements IDombNode<N>, IModifier<INonVoidDombNode> {
  parent: INonVoidDombNode | null = null;

  init(parent: INonVoidDombNode<Node>): void {
    this.parent = parent;
  }

  protected getParent(): INonVoidDombNode {
    if (!this.parent) {
      throw new Error('Parent is null. Is this node mounted?');
    }
    return this.parent!;
  }

  constructor(private domNode: N) {
    super();
  }

  getDomNode(): N {
    return this.domNode;
  }

  onMount(): void {
    //
  };

  destroySelf(): void {
    this.parent = null;
    this.unsubscribeAll();
  }

  applyToNode(node: INonVoidDombNode) {
    node.mountChild(this);
  }
}
