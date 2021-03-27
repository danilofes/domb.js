import { IModifier, DombNode } from './dombNode';
import { INodeWithModel } from './dombHtmlInputElements';
import { IState } from '../state';

export function model<V>(value: IState<V>): IModifier<DombNode & INodeWithModel<V>> {
  return {
    applyToNode(node: DombNode & INodeWithModel<V>) {
      value.bind(node, v => {
        node.setModelValue(v);
      });

      node.onModelValueChange((newV: V) => {
        value.setValue(newV);
      });
    },
  };
}
