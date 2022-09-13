import { IValueSource } from "../state";
import { DombNode } from "./dombNode";

export class IfDirective extends DombNode<Comment> {
  trueNode?: DombNode;
  falseNode?: DombNode;

  constructor(
    private condition: IValueSource<unknown>,
    private nodeFactoryTrue: () => DombNode,
    private nodeFactoryFalse?: () => DombNode
  ) {
    super(document.createComment("if node"));
  }

  acceptsChild(childNode: DombNode): boolean {
    return false;
  }

  onMount() {
    super.onMount();
    this.condition.bind(this, this.toggleNode.bind(this));
  }

  toggleNode(conditionValue: unknown) {
    if (conditionValue) {
      if (!this.trueNode) {
        this.trueNode = this.nodeFactoryTrue();
        this.parent!.addChild(this.trueNode, this.domNode);
      }
      if (this.falseNode) {
        this.parent!.removeChild(this.falseNode);
        delete this.falseNode;
      }
    } else {
      if (!this.falseNode && this.nodeFactoryFalse) {
        this.falseNode = this.nodeFactoryFalse();
        this.parent!.addChild(this.falseNode, this.domNode);
      }
      if (this.trueNode) {
        this.parent!.removeChild(this.trueNode);
        delete this.trueNode;
      }
    }
  }

  onDestroy() {
    if (this.falseNode) {
      this.parent!.removeChild(this.falseNode);
      delete this.falseNode;
    }
    if (this.trueNode) {
      this.parent!.removeChild(this.trueNode);
      delete this.trueNode;
    }
    super.onDestroy();
  }
}

export function $if(
  condition: IValueSource<unknown>,
  nodeFactoryTrue: () => DombNode,
  nodeFactoryFalse?: () => DombNode
) {
  return new IfDirective(condition, nodeFactoryTrue);
}
