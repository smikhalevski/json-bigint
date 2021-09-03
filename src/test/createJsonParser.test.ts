import * as fs from 'fs';
import * as path from 'path';
import {createJsonParser} from '../main/createJsonParser';

describe('createJsonParser', () => {

  const parseJson = createJsonParser();

  test('parses string', () => {
    expect(parseJson('"aaa"')).toBe('aaa');
  });

  test('resolves encoded chars string', () => {
    expect(parseJson('"con\\u0073\\u0074\\u0072\\u0075\\u0063tor"')).toBe('constructor');
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

  test('prevents prototype poisoning', () => {
    expect(parseJson('{"__proto__":"okay"}').__proto__).toBe('okay');
    expect(parseJson('{"\\u005f\\u005f\\u0070\\u0072\\u006f\\u0074\\u006f\\u005f\\u005f":"okay"}').__proto__).toBe('okay');
  });

  test('prevents constructor poisoning', () => {
    expect(parseJson('{"constructor":"okay"}').constructor).toBe('okay');
    expect(parseJson('{"\\u0063\\u006f\\u006e\\u0073\\u0074\\u0072\\u0075\\u0063\\u0074\\u006f\\u0072":"okay"}').constructor).toBe('okay');
  });

  test('__proto__ is  writable', () => {
    const obj = parseJson('{"__proto__":"okay"}');
    obj.__proto__ = 123;
    expect(obj.__proto__).toBe(123);
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

  test('parses huge input', () => {
    parseJson(fs.readFileSync(path.join(__dirname, './test.json'), 'utf8'));
  });

  test('throws on object after string', () => {
    expect(() => parseJson('"aaa"{}')).toThrow(new SyntaxError('Unexpected token at 5'));
  });

  test('throws on string after object', () => {
    expect(() => parseJson('{}"aaa"')).toThrow(new SyntaxError('Unexpected token at 2'));
  });
});
