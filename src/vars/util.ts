
export function removeFromArray<T>(array: T[], item: T) {
  const index = array.indexOf(item);
  if (index > -1) {
    array.splice(index, 1);
  }
}

export const noop = () => { };

export function isEmpty(value: { length: number }): boolean {
  return value.length === 0;
}
