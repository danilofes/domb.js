import { IScope, SimpleScope } from '../state';
import { IUnsubscribe } from '../vars/vars';

export interface IDombNode<N extends Node = Node> extends IScope {
  getDomNode(): N;
  destroySelf(): void;
}

export interface IDynamicDombNode<N extends Node = Node> extends IDombNode<N> {
  init(parent: INonVoidDombNode): void;
}

export interface INonVoidDombNode<N extends Node = Node> extends IDombNode<N> {
  mountChild(child: IDynamicDombNode, beforeNode?: Node): void;
  unmountChild(child: IDynamicDombNode): void;
}

export interface IModifier<N extends IDombNode, E = {}> {
  applyToNode(dombNode: N, node: E): void;
}

export interface INodeWithModel<V> extends IDombNode {
  setModelValue(value: V): void;

  onModelValueChange(callback: (newV: V) => void): IUnsubscribe;
}

export abstract class AbstractDombNode<N extends Node> extends SimpleScope implements IDombNode<N> {
  constructor(private domNode: N) {
    super();
  }

  destroySelf(): void {
    this.unsubscribeAll();
  }

  getDomNode(): N {
    return this.domNode;
  }
}

export abstract class AbstractDynamicDombNode<N extends Node> extends AbstractDombNode<N> implements IDynamicDombNode<N>, IModifier<INonVoidDombNode> {
  parent: INonVoidDombNode | null = null;

  constructor(domNode: N) {
    super(domNode);
  }

  init(parent: INonVoidDombNode<Node>): void {
    this.parent = parent;
    this.onMount();
  }

  protected onMount() {
    //
  }

  protected getParent(): INonVoidDombNode {
    if (!this.parent) {
      throw new Error('Parent is null. Is this node mounted?');
    }
    return this.parent!;
  }

  destroySelf(): void {
    this.parent = null;
    super.destroySelf();
  }

  applyToNode(node: INonVoidDombNode) {
    node.mountChild(this);
  }
}
