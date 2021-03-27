import { IValueSource, asValueSource, isValueSource, textVal } from '../state';
import { DombNode, IModifier } from './dombNode';


export class DombTextNode extends DombNode<Text> implements IModifier<DombNode> {

  constructor(private textVs: IValueSource<unknown>) {
    super(document.createTextNode(''));
  }

  acceptsChild(childNode: DombNode): boolean {
    return false;
  }

  onMount(): void {
    this.textVs.bind(this, value => {
      this.getDomNode().nodeValue = String(value);
    });
  }

  applyToNode(dombNode: DombNode) {
    dombNode.mountChild(this);
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
