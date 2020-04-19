import { empty } from "./util";

describe('empty', () => {
  it('should return true for empty string', () => {
    expect(empty('')).toBe(true)
  });

  it('should return true for empty array', () => {
    expect(empty([])).toBe(true)
  });
});