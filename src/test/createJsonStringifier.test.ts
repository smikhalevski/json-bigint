import {createJsonParser, createJsonStringifier} from '../main';

describe('createJsonStringifier', () => {

  const stringifyJson = createJsonStringifier({
    isBigInt: (value) => typeof value === 'bigint',
    stringifyBigInt: String,
  });

  test('stringifies bigint', () => {
    expect(stringifyJson({foo: BigInt(123)})).toBe('{"foo":123}');
  });

  test('stringifies number', () => {
    expect(stringifyJson({foo: 123})).toBe('{"foo":123.0}');
  });

  test('stringifies string', () => {
    expect(stringifyJson('abc')).toBe('"abc"');
  });

  test('stringifies null', () => {
    expect(stringifyJson(null)).toBe('null');
  });

  test('stringifies undefined', () => {
    expect(stringifyJson(undefined)).toBe(undefined);
  });

  test('stringifies function', () => {
    expect(stringifyJson(() => 123)).toBe(undefined);
  });

  test('stringifies symbol', () => {
    expect(stringifyJson(Symbol())).toBe(undefined);
  });

  test('stringifies object', () => {
    expect(stringifyJson({a: 1, b: 2})).toBe('{"a":1.0,"b":2.0}');
  });

  test('stringifies array', () => {
    expect(stringifyJson([1, 2])).toBe('[1.0,2.0]');
  });

  test('respects toJSON', () => {
    expect(stringifyJson({toJSON: () => 123})).toBe('123.0');
  });

  test('respects array of string replacer', () => {
    expect(stringifyJson({a: 1, b: 2}, ['a'])).toBe('{"a":1.0}');
  });

  test('respects array of number replacer', () => {
    expect(stringifyJson({1: 'a', 2: 'b'}, [1])).toBe('{"1":"a"}');
  });

  test('respects array of number replacer does not affect arrays', () => {
    expect(stringifyJson(['a', 'b'], [1])).toBe('["a","b"]');
  });

  test('respects function replacer', () => {
    const replacerMock = jest.fn((key, value) => value);

    expect(stringifyJson({a: 1, b: {c: 3}}, replacerMock)).toBe('{"a":1.0,"b":{"c":3.0}}');
    expect(replacerMock).toHaveBeenCalledTimes(4);
    expect(replacerMock).toHaveBeenNthCalledWith(1, '', {a: 1, b: {c: 3}});
    expect(replacerMock).toHaveBeenNthCalledWith(2, 'a', 1);
    expect(replacerMock).toHaveBeenNthCalledWith(3, 'b', {c: 3});
    expect(replacerMock).toHaveBeenNthCalledWith(4, 'c', 3);
  });

  test('respects spaces in empty objects', () => {
    expect(stringifyJson({}, null, 2)).toBe('{}');
  });

  test('respects spaces in objects', () => {
    expect(stringifyJson({a: 1, b: 2}, null, 2)).toBe('{\n  "a":1.0,\n  "b":2.0\n}');
  });

  test('respects spaces in empty arrays', () => {
    expect(stringifyJson([], null, 2)).toBe('[]');
  });

  test('respects spaces in arrays', () => {
    expect(stringifyJson([1, 2], null, 2)).toBe('[\n  1.0,\n  2.0\n]');
  });

  test('respects spaces in nested objects', () => {
    expect(stringifyJson({a: [1, 2], b: 3}, null, '  ')).toBe('{\n  "a":[\n    1.0,\n    2.0\n  ],\n  "b":3.0\n}');
  });

  test('respects spaces as string', () => {
    expect(stringifyJson([1, 2], null, '\t')).toBe('[\n\t1.0,\n\t2.0\n]');
  });

  test('respects empty string spaces', () => {
    expect(stringifyJson([1, 2], null, '')).toBe('[1.0,2.0]');
  });

  test('serialization is symmetrical', () => {
    const parseJson = createJsonParser({
      parseBigInt: BigInt,
    });
    expect(parseJson(stringifyJson({foo: BigInt(123)}))).toEqual({foo: BigInt(123)});
    expect(parseJson(stringifyJson({foo: 123}))).toEqual({foo: 123});
  });

  test('can be parsed by JSON', () => {
    expect(JSON.parse(stringifyJson({foo: BigInt(123)}))).toEqual({foo: 123});
    expect(JSON.parse(stringifyJson({foo: 123}))).toEqual({foo: 123});
  });
});
