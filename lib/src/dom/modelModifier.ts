import { IModifier, INodeWithModel } from './dombNode';
import { IState } from '../state';

export function model<V>(value: IState<V>): IModifier<INodeWithModel<V>> {
  return {
    applyToNode(node: INodeWithModel<V>) {
      // TODO
      value.bind(node, v => {
        node.setModelValue(v);
      });

      node.onModelValueChange((newV: V) => {
        value.setValue(newV);
      });
    },
  };
}
