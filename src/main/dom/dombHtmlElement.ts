import { INonVoidDombNode, IDombNode, AbstractDombNode, IModifier } from './dombNode';

export interface IDombHtmlElement<E extends HTMLElement> extends INonVoidDombNode<E> {
  getEl(): E;

  children(...children: IDombNode[]): void;
}

export class DombStaticHtmlElement<E extends HTMLElement> extends AbstractDombNode<E> implements IDombHtmlElement<E> {

  protected _children: IDombNode[] = [];

  constructor(protected el: E) {
    super(el);
  }

  getEl() {
    return this.el;
  }

  mountChild(dombNode: IDombNode, beforeNode?: Node) {
    dombNode.init(this);
    this.el.insertBefore(dombNode.getDomNode(), beforeNode ?? null);
    this._children.push(dombNode);
    dombNode.onMount();
  }

  unmountChild(dombNode: IDombNode): void {
    const idx = this._children.indexOf(dombNode);
    if (idx !== -1) {
      dombNode.destroySelf();
      this._children.splice(idx, 1);
      this.el.removeChild(dombNode.getDomNode());;
    }
  }

  children(...children: IDombNode[]) {
    for (const child of children) {
      this.mountChild(child);
    }
  }

  destroySelf(): void {
    for (let i = this._children.length - 1; i >= 0; i--) {
      this.unmountChild(this._children[i]);
    }
    super.destroySelf();
  }

}

export function root<E extends HTMLElement>(element: E | null): DombStaticHtmlElement<E> {
  if (element === null) {
    throw new Error('element should not be null');
  }
  return new DombStaticHtmlElement<E>(element);
}

export class DombDynamicHtmlElement<K extends keyof HTMLElementTagNameMap> extends DombStaticHtmlElement<HTMLElementTagNameMap[K]> {

  constructor(tagName: K, private modifiers: IModifier<IDombNode<HTMLElementTagNameMap[K]>>[]) {
    super(document.createElement(tagName));
  }

  onMount() {
    for (const m of this.modifiers) {
      m.applyToNode(this, this.getDomNode());
    }
  }

  applyToNode(node: INonVoidDombNode) {
    node.mountChild(this);
  };
}
