import {decodeString} from '../main/decodeString';

describe('decodeString', () => {

  test('decodes UTF chars', () => {
    expect(decodeString('con\\u0073\\u0074\\u0072\\u0075\\u0063tor')).toBe('constructor');
  });

  test('decodes newline', () => {
    expect(decodeString('aaa\\nbbb')).toBe('aaa\nbbb');
  });

  test('throws if escaped char is invalid', () => {
    expect(() => decodeString('aaa\\wbbb')).toThrow();
  });
});
