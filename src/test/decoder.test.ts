import {encode} from '../main/decoder';

describe('encode', () => {

  test('preserves chars', () => {
    expect(encode('abc')).toBe('"abc"');
  });

  test('escapes UTF chars', () => {
    expect(encode('\u070f')).toBe('"\\u070f"');
  });

  test('escapes UTF chars and adds leading zeroes', () => {
    expect(encode('\x1f')).toBe('"\\u001f"');
  });

  test('escapes known chars in mixed string', () => {
    expect(encode('aaa\bbbb')).toBe('"aaa\\bbbb"');
  });

  test('escapes UTF chars in mixed string', () => {
    expect(encode('aaa\u070fbbb')).toBe('"aaa\\u070fbbb"');
  });

  test('escapes known chars', () => {
    expect(encode('\b')).toBe('"\\b"');
    expect(encode('\t')).toBe('"\\t"');
    expect(encode('\n')).toBe('"\\n"');
    expect(encode('\f')).toBe('"\\f"');
    expect(encode('\r')).toBe('"\\r"');
    expect(encode('"')).toBe('"\\""');
    expect(encode('\\')).toBe('"\\\\"');
  });
});
