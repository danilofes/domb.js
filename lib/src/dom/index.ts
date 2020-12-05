import { IValueSource, IState, isValueSource } from "../state";

export class DombNode {}

export class DombDirective extends DombNode implements Modifier<DombElement<HTMLElement>> {
  applyToNode(parentNode: DombElement<HTMLElement>) {
    //
  }
}

export interface Modifier<N extends DombNode> {
  applyToNode(node: N): void;
}

export class DombElement<E extends HTMLElement = HTMLElement> extends DombNode implements Modifier<DombElement<HTMLElement>> {
  getElement(): E {
    return null as any;
  }

  children(...nodes: DombNode[]) {

  }

  applyToNode(parentNode: DombElement<HTMLElement>) {
    //
  }
}

export class DombTextNode extends DombNode implements Modifier<DombElement<HTMLElement>> {
  applyToNode(parentNode: DombElement<HTMLElement>) {
    //
  }
}


export function text(arg0: IValueSource<unknown> | TemplateStringsArray, ...args: unknown[]): DombTextNode {
  if (isValueSource(arg0)) {
    return new DombTextNode();
  } else {
    return new DombTextNode();
  }
}

export function root<E extends HTMLElement>(element: E | null): DombElement<E> {
  if (element === null) {
    throw new Error('element should not be null');
  }
  return new DombElement<E>();
}

// DIRECTIVES

export function $if(condition: IValueSource<unknown>, nodeFactory: () => DombNode) {
  return new DombDirective();
}

export function $repeat<T>(values: IValueSource<T[]>, buildItem: (item: T) => DombNode) {
  return new DombDirective();
}

// MODIFIERS

export function onSubmit(callback: () => void): Modifier<DombElement<HTMLFormElement>> {
  return {
    applyToNode(formNode: DombElement<HTMLFormElement>) {
      //
    },
  };
}


export function checked(value: IValueSource<unknown>, onChange: (newValue: boolean) => void): Modifier<DombElement<HTMLInputElement>> {
  return {
    applyToNode(formNode: DombElement<HTMLInputElement>) {
      //
      const s = formNode.getElement().checked;
    }
  };
}

export function attr(name: string, value: string): Modifier<DombElement<HTMLElement>> {
  return {
    applyToNode(formNode: DombElement<HTMLElement>) {
      //
      const s = formNode.getElement().setAttribute('x', 'y');
    }
  };
}

export function model<V>(state: IState<V>): Modifier<DombElement<HTMLInputElement>> {
  return {
    applyToNode(formNode: DombElement<HTMLInputElement>) {
      //
      const s = formNode.getElement().setAttribute('x', 'y');
    }
  };
}


// ELEMENTS

function dombElementOf<K extends keyof HTMLElementTagNameMap>(tagName: K): (...modifiers: Modifier<DombElement<HTMLElementTagNameMap[K]>>[]) => DombElement<HTMLElementTagNameMap[K]> {
  return function(...modifiers) {
    return new DombElement<HTMLElementTagNameMap[K]>();
  }
}

export const el = {
  form: dombElementOf('form'),
  div: dombElementOf('div'),
  ul: dombElementOf('ul'),
  li: dombElementOf('ul'),
  input: dombElementOf('input'),
  inputText: dombElementOf('input'),
  inputCheckbox: dombElementOf('input')
}

/*
export function Form(...modifiers: Modifier<DombElement<HTMLFormElement>>[]): DombElement<HTMLFormElement> {
  return new DombElement<HTMLFormElement>();
}

export function Div(...modifiers: Modifier<DombElement<HTMLDivElement>>[]): DombElement<HTMLDivElement> {
  return new DombElement<HTMLDivElement>();
}

export function Ul(...modifiers: Modifier<DombElement<HTMLUListElement>>[]): DombElement<HTMLUListElement> {
  return new DombElement<HTMLUListElement>();
}

export function Li(...modifiers: Modifier<DombElement<HTMLLIElement>>[]): DombElement<HTMLLIElement> {
  return new DombElement<HTMLLIElement>();
}

export function InputCheckbox(...modifiers: Modifier<DombElement<HTMLInputElement>>[]) {
  return new DombElement<HTMLInputElement>();
}

export function InputText(...modifiers: Modifier<DombElement<HTMLInputElement>>[]) {
  return new DombElement<HTMLInputElement>();
}
*/