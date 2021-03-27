import { DombNode, IModifier } from './dombNode';
import { ValueLike, asValueSource, IScope, UnwrapedValue } from '../state';

interface IPropsConfig {
  [key: string]: ValueLike<any>
}

type PropsOfConfig<C extends IPropsConfig> = {
  [K in keyof C]: UnwrapedValue<C[K]>
}

export function properties<T extends IPropsConfig>(props: T): IModifier<DombNode<Node & PropsOfConfig<T>>> {
  return {
    applyToNode(dombNode: DombNode<Node & PropsOfConfig<T>>) {
      for (let key in props) {
        bindProperty(dombNode, dombNode.getDomNode(), key, props[key]);
      }
    }
  };
}

export function prop<K extends string, V>(propKey: K, value: ValueLike<V>): IModifier<DombNode<Node & { [key in K]: V }>> {
  return {
    applyToNode(dombNode: DombNode<Node & { [key in K]: V }>) {
      bindProperty<{ [key in K]: V }, K>(dombNode, dombNode.getDomNode(), propKey, value);
    }
  };
}

function bindProperty<T, K extends keyof T>(scope: IScope, node: T, propKey: K, value: ValueLike<T[K]>) {
  asValueSource(value).bind(scope, propValue => {
    node[propKey] = propValue;
  });
}
