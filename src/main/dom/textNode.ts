import { IValueSource, asValueSource, isValueSource, textVal } from '../state';
import { INonVoidDombNode, AbstractDombNode } from './dombNode';


export class DombTextNode extends AbstractDombNode<Text> {

  constructor(private textValue: IValueSource<unknown>) {
    super(document.createTextNode(''));
  }

  init(parent: INonVoidDombNode): void {
    this.textValue.bind(this, value => {
      this.getDomNode().textContent = String(value);
    })
  }

  applyToNode(node: INonVoidDombNode) {
    node.mountChild(this);
  };
}

export function text(arg0: string | number | IValueSource<unknown> | TemplateStringsArray, ...args: unknown[]): DombTextNode {
  if (typeof arg0 === 'string') {
    return new DombTextNode(asValueSource(arg0));
  } else if (typeof arg0 === 'number') {
    return new DombTextNode(asValueSource(arg0));
  } else if (isValueSource(arg0)) {
    return new DombTextNode(arg0);
  } else {
    return new DombTextNode(textVal(arg0, ...args));
  }
}
