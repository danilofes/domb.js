import { IValueSource, asValueSource, isValueSource, textVal } from '../state';
import { DombNode } from './dombNode';


export class DombTextNode extends DombNode<Text> {

  constructor(private textVs: IValueSource<unknown>) {
    super(document.createTextNode(''));
  }

  acceptsChild(childNode: DombNode): boolean {
    return false;
  }

  onMount(): void {
    super.onMount();
    this.textVs.bind(this, value => {
      this.domNode.nodeValue = String(value);
    });
  }
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
