import { IValueSource } from '../state';
import { DombNode } from './dombNode';

export class IfDirective extends DombNode<Comment> {
  mountedNode?: DombNode;

  constructor(private condition: IValueSource<unknown>, private nodeFactoryTrue: () => DombNode) {
    super(document.createComment('if node'));
  }

  acceptsChild(childNode: DombNode): boolean {
    return false;
  }

  onMount() {
    this.condition.bind(this, this.toggleNode.bind(this));
  }

  toggleNode(shouldMount: unknown) {
    if (shouldMount) {
      if (!this.mountedNode) {
        this.mountedNode = this.nodeFactoryTrue();
        this.getParent()!.mountChild(this.mountedNode, this.getDomNode());
      }
    } else {
      if (this.mountedNode) {
        this.getParent()!.unmountChild(this.mountedNode);
        delete this.mountedNode;
      }
    }
  }

  onDestroy() {
    this.toggleNode(false);
    super.onDestroy();
  }
}

export function $if(condition: IValueSource<unknown>, nodeFactoryTrue: () => DombNode) {
  return new IfDirective(condition, nodeFactoryTrue);
}
