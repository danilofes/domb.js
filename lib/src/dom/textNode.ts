import { IValueSource, asValueSource, isValueSource, combine } from '../state';
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

export function text(arg0: string | IValueSource<unknown> | TemplateStringsArray, ...args: unknown[]): DombTextNode {
  if (typeof arg0 === 'string') {
    return new DombTextNode(asValueSource(arg0));
  } else if (isValueSource(arg0)) {
    return new DombTextNode(arg0);
  } else {
    const valueSources = args.map(asValueSource);
    return new DombTextNode(
      combine(valueSources, values => {
        applyTemplateString(arg0, values);
      })
    );
  }
}

function applyTemplateString(strs: TemplateStringsArray, ...args: unknown[]): string {
  var result: string = strs[0];
  for (var i = 1; i < strs.length; i++) {
    result += args[i - 1];
    result += strs[i];
  }
  return result;
}
