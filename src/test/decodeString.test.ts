import {decodeString} from '../main/decodeString';

describe('decodeString', () => {

  test('decodes UTF chars', () => {
    expect(decodeString('con\\u0073\\u0074\\u0072\\u0075\\u0063tor', 0)).toBe('constructor');
  });

  test('decodes newline', () => {
    expect(decodeString('aaa\\nbbb', 0)).toBe('aaa\nbbb');
  });

  test('throws if illegal escape token', () => {
    expect(() => decodeString('aaa\\wbbb', 10)).toThrow('Illegal escape token at position 13');
  });

  test('throws if invalid UTF code', () => {
    expect(() => decodeString('aaa\\uzzzzbbb', 10)).toThrow('Invalid UTF code at position 13');
  });
});
