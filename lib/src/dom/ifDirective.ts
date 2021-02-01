import { IValueSource } from '../state';
import { IDombNode, AbstractDombNode } from './dombNode';

export class IfDirective extends AbstractDombNode<Comment> {

  mountedNode?: IDombNode;

  constructor(private condition: IValueSource<unknown>, private nodeFactoryTrue: () => IDombNode) {
    super(document.createComment('if node'));
  }

  onMount() {
    this.condition.bind(this, this.toggleNode.bind(this));
  }

  toggleNode(shouldMount: unknown) {
    if (shouldMount) {
      if (!this.mountedNode) {
        this.mountedNode = this.nodeFactoryTrue();
        this.getParent().mountChild(this.mountedNode, this.getDomNode());
      }
    } else {
      if (this.mountedNode) {
        this.getParent().unmountChild(this.mountedNode);
        delete this.mountedNode;
      }
    }
  }

  destroySelf() {
    this.toggleNode(false);
    super.destroySelf();
  }
}

export function $if(condition: IValueSource<unknown>, nodeFactoryTrue: () => IDombNode) {
  return new IfDirective(condition, nodeFactoryTrue);
}
