import fs from 'fs';
import path from 'path';
import {createJsonParser} from '../main/createJsonParser';

describe('createJsonParser', () => {

  const parseJson = createJsonParser();

  test('parses string', () => {
    expect(parseJson('"aaa"')).toBe('aaa');
  });

  test('parses number', () => {
    expect(parseJson('123.0')).toBe(123);
  });

  test('parses bigint', () => {
    expect(parseJson('123')).toBe(BigInt(123));
  });

  test('parses true', () => {
    expect(parseJson('true')).toBe(true);
  });

  test('parses false', () => {
    expect(parseJson('false')).toBe(false);
  });

  test('parses null', () => {
    expect(parseJson('null')).toBe(null);
  });

  test('parses object', () => {
    expect(parseJson('{}')).toEqual({});
  });

  test('parses object with properties', () => {
    expect(parseJson('{"foo":"abc","bar":123}')).toEqual({foo: 'abc', bar: BigInt(123)});
  });

  test('parses nested objects', () => {
    expect(parseJson('{"foo":{"bar":123.0}}')).toEqual({foo: {bar: 123}});
  });

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

  test('parses complex input', () => {
    expect(parseJson('{"foo":[null,"abc",true],"bar":123,"baz":123.0}')).toEqual({
      foo: [null, 'abc', true],
      bar: BigInt(123),
      baz: 123,
    });
  });

  test('parses huge input', () => {
    parseJson(fs.readFileSync(path.join(__dirname, './test.json'), 'utf8'));
  });
});
