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
    super.onMount();
    this.condition.bind(this, this.toggleNode.bind(this));
  }

  toggleNode(shouldMount: unknown) {
    if (shouldMount) {
      if (!this.mountedNode) {
        this.mountedNode = this.nodeFactoryTrue();
        this.parent!.addChild(this.mountedNode, this.domNode);
      }
    } else {
      if (this.mountedNode) {
        this.parent!.removeChild(this.mountedNode);
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
