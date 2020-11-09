import { IUnsubscribe, IVal } from "../vars/vars";
import { arrayRemove, noop } from "../vars/util";


export interface DNode {
  mount(context: DNodeContext): MountedDNode;
}

export interface MountedDNode {
  mainNode: Node,
  unmount(): void
}

let nodeCounter = 0;

export class DNodeContext {
  public readonly nid: number = ++nodeCounter;
  private undoList: IUnsubscribe[] = [];

  constructor(public readonly parentElement: HTMLElement, public readonly referenceNode: Node | null, public readonly parent?: DNodeContext) { }

  appendNode<T extends Node>(node: T): T {
    const appendedNode = this.parentElement.insertBefore(node, this.referenceNode);
    this.addUndo(() => { this.parentElement.removeChild(appendedNode) });
    return appendedNode;
  }

  addUndo<T>(unsubFn: IUnsubscribe): IUnsubscribe {
    this.undoList.push(unsubFn);
    return () => {
      arrayRemove(this.undoList, unsubFn);
      unsubFn();
    }
  }

  bindElementAttribute(node: Element, key: string, v: IVal<string | boolean> | string | boolean): IUnsubscribe {
    if (typeof v === 'string' || typeof v === 'boolean') {
      setElementAttribute(node, key, v);
      return noop;
    } else {
      setElementAttribute(node, key, v.value);
      return this.addUndo(v.watch(newValue => setElementAttribute(node, key, newValue)));
    }
  }

  bindElementProperty(node: Element, key: string, v: IVal<any> | any): IUnsubscribe {
    if (!('watch' in v)) {
      setElementProperty(node, key, v);
      return noop;
    } else {
      setElementProperty(node, key, v.value);
      return this.addUndo(v.watch((newValue: any) => setElementProperty(node, key, newValue)));
    }
  }

  bindElementClass(node: Element, className: string, enabled: IVal<boolean>): IUnsubscribe {
    setElementClass(node, className, enabled.value);
    return this.addUndo(enabled.watch(newValue => setElementClass(node, className, newValue)));
  }

  bindInputValue(input: HTMLInputElement, v: IVal<string>): IUnsubscribe {
    input.value = v.value;
    return this.addUndo(v.watch(newValue => { input.value = newValue; }));
  }

  mountChild(child: DNode, parentElement: HTMLElement, referenceNode: Node | null): MountedDNode {
    return child.mount(new DNodeContext(parentElement, referenceNode, this));
  }

  end(mainNode: Node): MountedDNode {
    const unmountFn = () => {
      for (let i = this.undoList.length - 1; i >= 0; i--) {
        this.undoList[i]();
      }
      this.undoList = [];
    };

    return {
      mainNode,
      unmount: this.parent ? this.parent.addUndo(unmountFn) : unmountFn
    };
  }
}

function setElementAttribute(element: Element, attr: string, value: string | boolean) {
  if (value === false) {
    element.removeAttribute(attr);
  } else if (value === true) {
    element.setAttribute(attr, '');
  } else {
    element.setAttribute(attr, value);
  }
}

function setElementProperty(element: Element, propKey: string, value: any) {
  (element as any)[propKey] = value;
}

function setElementClass(element: Element, className: string, enabled: boolean) {
  if (enabled) {
    element.classList.add(className);
  } else {
    element.classList.remove(className);
  }
}