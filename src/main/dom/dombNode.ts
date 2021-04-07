import { asValueSource, SimpleScope, ValueLike } from '../state';
import { IUnsubscribe } from '../vars/vars-api';

type NodeStatus = 'unmounted' | 'mounted' | 'destroyed';

export abstract class DombNode<N extends Node = Node, C = unknown> extends SimpleScope implements IModifier<DombNode> {
  protected parent: DombNode | null = null;
  protected status: NodeStatus = 'unmounted';
  private _children: DombNode[] = [];
  private _configs?: C[] = [];
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

  private unmountChild(child: DombNode) {
    if (child.status === 'mounted') {
      child.onDestroy();
      this.domNode.removeChild(child.domNode);
      child.status = 'destroyed';
    }
  }

  abstract acceptsChild(childNode: DombNode): boolean;

  protected onMount(): void {
    if (this._configs) {
      for (let config of this._configs) {
        this.applyConfig(config);
      }
      delete this._configs;
    }
    for (let child of this._children) {
      this.mountChild(child);
    }
  }

  protected onDestroy() {
    this.removeChildren();
    this.unsubscribeAll();
  }

  private removeChildren() {
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

  applyToNode(dombNode: DombNode) {
    dombNode.addChild(this);
  }

  protected applyConfig(config: C): void {
    // should be overriden when necessary
  }

  bindProp<K extends keyof N>(prop: K, vs: ValueLike<N[K]>): IUnsubscribe {
    return asValueSource(vs).bind(this, value => this._domNode[prop] = value);
  }

  apply<T extends DombNode<N, C>>(this: T, config: C): T {
    if (this._configs) {
      this._configs.push(config);
    } else {
      this.applyConfig(config);
    }
    return this;
  }

  children<T extends DombNode>(this: T, ...children: DombNode[]) {
    this.removeChildren();
    for (const child of children) {
      this.addChild(child);
    }
    return this;
  }
}

export interface IModifier<T extends DombNode> {
  applyToNode(dombNode: T): void;
}
