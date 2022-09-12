
export function append<T>(element: T): (array: T[]) => T[] {
  return array => [...array, element];
}

export function removeAt<T>(index: number): (array: T[]) => T[] {
  return array => [...array.slice(0, index), ...array.slice(index + 1)];
}

export function replaceAt<T>(index: number, element: T): (array: T[]) => T[] {
  return array => [...array.slice(0, index), element, ...array.slice(index + 1)];
}
