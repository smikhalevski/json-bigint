import {parseJson} from '../main/parseJson';

describe('parseJson', () => {

  test('parses array', () => {
    expect(parseJson('[]')).toEqual([]);
  });

  test('parses array with items', () => {
    expect(parseJson('["foo", 123]')).toEqual(['foo', BigInt(123)]);
  });

  test('parses nested arrays', () => {
    expect(parseJson('[["foo"], [123]]')).toEqual([['foo'], [BigInt(123)]]);
  });

  test('parses mixed objects and arrays', () => {
    expect(parseJson('[{"foo":"abc"}]')).toEqual([{foo: 'abc'}]);
  });

  test('throws on object after string', () => {
    expect(() => parseJson('"aaa"{}')).toThrow();
  });

  test('throws on string after object', () => {
    expect(() => parseJson('{}"aaa"')).toThrow();
  });
});
