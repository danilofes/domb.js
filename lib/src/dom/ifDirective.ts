import { IValueSource } from '../state';
import { IDynamicDombNode, AbstractDynamicDombNode } from './dombNode';

export class IfDirective extends AbstractDynamicDombNode<Comment> {

  mountedNode?: IDynamicDombNode;

  constructor(private condition: IValueSource<unknown>, private nodeFactoryTrue: () => IDynamicDombNode) {
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

export function $if(condition: IValueSource<unknown>, nodeFactoryTrue: () => IDynamicDombNode) {
  return new IfDirective(condition, nodeFactoryTrue);
}
