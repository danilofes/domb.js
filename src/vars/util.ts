
export function arrayRemove<T>(array: T[], item: T): void {
  const index = array.indexOf(item);
  if (index > -1) {
    array.splice(index, 1);
  }
}

export function arrayRemoveAt<T>(array: T[], index: number): T[] {
  const result = [...array];
  result.splice(index, 1);
  return result;
}

export function arrayReplaceAt<T>(array: T[], index: number, item: T): T[] {
  const result = [...array];
  result[index] = item;
  return result;
}

export const noop = () => { };

export function isEmpty(value: { length: number }): boolean {
  return value.length === 0;
}

export function isZero(value: number): boolean {
  return value === 0;
}

export function isEqualTo<T>(v2: T): (v1: T) => boolean {
  return (v1: T) => v1 === v2;
}
