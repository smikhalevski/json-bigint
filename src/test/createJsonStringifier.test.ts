import {createJsonParser, createJsonStringifier} from '../main';

describe('createJsonStringifier', () => {

  const stringifyJson = createJsonStringifier();

  test('stringifies bigint', () => {
    expect(stringifyJson({foo: BigInt(123)})).toBe('{"foo":123}');
  });

  test('stringifies number', () => {
    expect(stringifyJson({foo: 123})).toBe('{"foo":123.0}');
  });

  test('serialization is symmetrical', () => {
    const parseJson = createJsonParser();
    expect(parseJson(stringifyJson({foo: BigInt(123)}))).toEqual({foo: BigInt(123)});
    expect(parseJson(stringifyJson({foo: 123}))).toEqual({foo: 123});
  });
});
