import { DombNode, IModifier } from './dombNode';

export abstract class DombHtmlElement<E extends HTMLElement> extends DombNode<E> {
  constructor(el: E) {
    super(el);
  }

  acceptsChild(child: DombNode) {
    return true;
  }
}

export class DombStaticHtmlElement<E extends HTMLElement> extends DombHtmlElement<E> {
  constructor(el: E) {
    super(el);
    this.status = 'mounted';
  }
}

export function root<E extends HTMLElement>(element: E | null): DombStaticHtmlElement<E> {
  if (element === null) {
    throw new Error('element should not be null');
  }
  return new DombStaticHtmlElement<E>(element);
}

export class DombDynamicHtmlElement<K extends keyof HTMLElementTagNameMap> extends DombHtmlElement<HTMLElementTagNameMap[K]> {
  constructor(tagName: K, private modifiers: IModifier<DombNode<HTMLElementTagNameMap[K]>>[]) {
    super(document.createElement(tagName));
  }

  onMount() {
    super.onMount();
    for (const m of this.modifiers) {
      m.applyToNode(this);
    }
  }
}
