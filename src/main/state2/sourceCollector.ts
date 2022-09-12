import { IValueSource } from "./events";

let valueSources: null | Set<IValueSource<unknown>> = null;
let nesting = 0;

export function readAndNotify<T>(vs: IValueSource<unknown>, fn: () => T): T {
  if (nesting === 0 && valueSources != null) {
    valueSources.add(vs);
  }
  try {
    nesting++;
    const result = fn();
    return result;
  } finally {
    nesting--;
  }
}

export function collectSources<T>(fn: () => T): [T, Set<IValueSource<unknown>>] {
  valueSources = new Set();
  const value = fn();
  const sources = valueSources;
  valueSources = null;
  console.log(`collectSources = [${value}, ${sources}]`);
  return [value, sources];
}
