import {stringReader} from '../main/stringReader';

describe('stringReader', () => {

  test('reads string', () => {
    expect(stringReader('"aaa"', 0, undefined)).toBe(5);
  });

  test('reads string with escaped quote chars', () => {
    expect(stringReader('"aaa\\"bbb\\""', 0, undefined)).toBe(12);
  });

  test('reads string with quote chars preceded by escape char', () => {
    expect(stringReader('"aaa\\\\"bbb\\\\""', 0, undefined)).toBe(7);
    expect(stringReader('"\\\\\\\\"', 0, undefined)).toBe(6);
  });

  test('throws if string is unterminated', () => {
    expect(() => stringReader('"aaa', 0, undefined)).toThrow('Unterminated string at position 0');
  });

  test('throws if string with escaped quote chars is unterminated', () => {
    expect(() => stringReader('"\\\\\\"', 0, undefined)).toThrow('Unterminated string at position 0');
    expect(() => stringReader('"aaa\\"', 0, undefined)).toThrow('Unterminated string at position 0');
  });
});
