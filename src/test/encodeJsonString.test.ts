import {encodeJsonString} from '../main/encodeJsonString';

describe('encodeJsonString', () => {

  test('preserves chars', () => {
    expect(encodeJsonString('abc')).toBe('"abc"');
  });

  test('escapes UTF chars', () => {
    expect(encodeJsonString('\u070f')).toBe('"\\u070f"');
  });

  test('escapes UTF chars and adds leading zeroes', () => {
    expect(encodeJsonString('\x1f')).toBe('"\\u001f"');
  });

  test('escapes known chars in mixed string', () => {
    expect(encodeJsonString('aaa\bbbb')).toBe('"aaa\\bbbb"');
  });

  test('escapes UTF chars in mixed string', () => {
    expect(encodeJsonString('aaa\u070fbbb')).toBe('"aaa\\u070fbbb"');
  });

  test('escapes known chars', () => {
    expect(encodeJsonString('\b')).toBe('"\\b"');
    expect(encodeJsonString('\t')).toBe('"\\t"');
    expect(encodeJsonString('\n')).toBe('"\\n"');
    expect(encodeJsonString('\f')).toBe('"\\f"');
    expect(encodeJsonString('\r')).toBe('"\\r"');
    expect(encodeJsonString('"')).toBe('"\\""');
    expect(encodeJsonString('\\')).toBe('"\\\\"');
  });
});
