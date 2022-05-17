import {encodeString} from '../main/encodeString';

describe('encodeString', () => {

  test('preserves chars', () => {
    expect(encodeString('abc')).toBe('"abc"');
  });

  test('escapes UTF chars', () => {
    expect(encodeString('\u070f')).toBe('"\\u070f"');
  });

  test('escapes UTF chars and adds leading zeroes', () => {
    expect(encodeString('\x1f')).toBe('"\\u001f"');
  });

  test('escapes known chars in mixed string', () => {
    expect(encodeString('aaa\bbbb')).toBe('"aaa\\bbbb"');
  });

  test('escapes UTF chars in mixed string', () => {
    expect(encodeString('aaa\u070fbbb')).toBe('"aaa\\u070fbbb"');
  });

  test('escapes known chars', () => {
    expect(encodeString('\b')).toBe('"\\b"');
    expect(encodeString('\t')).toBe('"\\t"');
    expect(encodeString('\n')).toBe('"\\n"');
    expect(encodeString('\f')).toBe('"\\f"');
    expect(encodeString('\r')).toBe('"\\r"');
    expect(encodeString('"')).toBe('"\\""');
    expect(encodeString('\\')).toBe('"\\\\"');
  });
});
