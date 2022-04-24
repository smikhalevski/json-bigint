import {ParserContext} from '../main/parser-types';
import {stringReader} from '../main/stringReader';

describe('stringReader', () => {

  let context: ParserContext;

  beforeEach(() => {
    context = {
      stack: [],
      cursor: 0,
      arrayMode: false,
      objectKey: '',
      input: '',
      parseBigInt: BigInt,
    };
  });

  test('reads string', () => {
    expect(stringReader('"aaa"', 0, context)).toBe(5);
  });

  test('reads string with escaped quote chars', () => {
    expect(stringReader('"aaa\\"bbb\\""', 0, context)).toBe(12);
  });

  test('throws if string is unterminated', () => {
    expect(() => stringReader('"aaa', 0, context)).toThrow();
  });

  test('throws if string with escaped quote chars is unterminated', () => {
    expect(() => stringReader('"aaa\\"', 0, context)).toThrow();
  });
});
