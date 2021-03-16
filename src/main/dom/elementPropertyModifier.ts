import { IDombNode, IModifier } from './dombNode';
import { ValueLike, asValueSource, IScope } from '../state';

type IPropertiesConfig<T> = {
  [K in (string & keyof T)]?: ValueLike<T[K]>
}

export function properties<T>(props: IPropertiesConfig<T>): IModifier<IDombNode, T> {
  return {
    applyToNode(dombNode: IDombNode, node: T) {
      for (let key in props) {
        const propKey = key as string & keyof T;
        bindProperty(dombNode, node, propKey, props[propKey]!);
      }
    }
  };
}

export function prop<K extends string, V>(propKey: K, value: ValueLike<V>): IModifier<IDombNode, { [key in K]: V }> {
  return {
    applyToNode(dombNode: IDombNode, node: { [key in K]: V }) {
      bindProperty(dombNode, node, propKey, value);
    }
  };
}

function bindProperty<T, K extends (string & keyof T)>(scope: IScope, node: T, propKey: K, value: ValueLike<T[K]>) {
  asValueSource(value).bind(scope, propValue => {
    node[propKey] = propValue;
  });
}
