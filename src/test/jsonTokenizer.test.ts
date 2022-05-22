import * as fs from 'fs';
import * as path from 'path';
import {TokenHandler} from 'tokenizer-dsl';
import {jsonTokenizer, TokenType} from '../main/jsonTokenizer';
import {ParserContext} from '../main/parser-types';

describe('jsonTokenizer', () => {

  const handlerMock = jest.fn();

  const context: ParserContext = Symbol('context') as any;

  const handler: TokenHandler<TokenType, ParserContext> = (type, chunk, offset, length, context) => {
    handlerMock(type, offset, length, context);
  };

  beforeEach(() => {
    handlerMock.mockReset();
  });

  test('tokenizes objects', () => {
    jsonTokenizer('{}', handler, context);

    expect(handlerMock).toHaveBeenCalledTimes(2);
    expect(handlerMock).toHaveBeenNthCalledWith(1, TokenType.OBJECT_START, 0, 1, context);
    expect(handlerMock).toHaveBeenNthCalledWith(2, TokenType.OBJECT_END, 1, 1, context);
  });

  test('tokenizes object with a key', () => {
    jsonTokenizer('{"aaa": "bbb"}', handler, context);

    expect(handlerMock).toHaveBeenCalledTimes(4);
    expect(handlerMock).toHaveBeenNthCalledWith(1, TokenType.OBJECT_START, 0, 1, context);
    expect(handlerMock).toHaveBeenNthCalledWith(2, TokenType.STRING, 1, 5, context);
    // expect(handlerMock).toHaveBeenNthCalledWith(3, TokenType.COLON, 6, 1, context);
    expect(handlerMock).toHaveBeenNthCalledWith(3, TokenType.STRING, 8, 5, context);
    expect(handlerMock).toHaveBeenNthCalledWith(4, TokenType.OBJECT_END, 13, 1, context);
  });

  test('tokenizes arrays', () => {
    jsonTokenizer('[]', handler, context);

    expect(handlerMock).toHaveBeenCalledTimes(2);
    expect(handlerMock).toHaveBeenNthCalledWith(1, TokenType.ARRAY_START, 0, 1, context);
    expect(handlerMock).toHaveBeenNthCalledWith(2, TokenType.ARRAY_END, 1, 1, context);
  });

  test('tokenizes arrays with numbers', () => {
    jsonTokenizer('[111,222]', handler, context);

    expect(handlerMock).toHaveBeenCalledTimes(5);
    expect(handlerMock).toHaveBeenNthCalledWith(1, TokenType.ARRAY_START, 0, 1, context);
    expect(handlerMock).toHaveBeenNthCalledWith(2, TokenType.BIGINT, 1, 3, context);
    expect(handlerMock).toHaveBeenNthCalledWith(3, TokenType.COMMA, 4, 1, context);
    expect(handlerMock).toHaveBeenNthCalledWith(4, TokenType.BIGINT, 5, 3, context);
    expect(handlerMock).toHaveBeenNthCalledWith(5, TokenType.ARRAY_END, 8, 1, context);
  });

  test('tokenizes floating number', () => {
    jsonTokenizer('123.123', handler, context);

    expect(handlerMock).toHaveBeenCalledTimes(1);
    expect(handlerMock).toHaveBeenNthCalledWith(1, TokenType.NUMBER, 0, 7, context);
  });

  test('tokenizes negative floating number', () => {
    jsonTokenizer('-123.123', handler, context);

    expect(handlerMock).toHaveBeenCalledTimes(1);
    expect(handlerMock).toHaveBeenNthCalledWith(1, TokenType.NUMBER, 0, 8, context);
  });

  test('tokenizes exponential number', () => {
    jsonTokenizer('123e5', handler, context);

    expect(handlerMock).toHaveBeenCalledTimes(1);
    expect(handlerMock).toHaveBeenNthCalledWith(1, TokenType.NUMBER, 0, 5, context);
  });

  test('tokenizes negative exponential number', () => {
    jsonTokenizer('-123e5', handler, context);

    expect(handlerMock).toHaveBeenCalledTimes(1);
    expect(handlerMock).toHaveBeenNthCalledWith(1, TokenType.NUMBER, 0, 6, context);
  });

  test('tokenizes exponential number with negative power', () => {
    jsonTokenizer('123e-5', handler, context);

    expect(handlerMock).toHaveBeenCalledTimes(1);
    expect(handlerMock).toHaveBeenNthCalledWith(1, TokenType.NUMBER, 0, 6, context);
  });

  test('tokenizes bigint', () => {
    jsonTokenizer('123', handler, context);

    expect(handlerMock).toHaveBeenCalledTimes(1);
    expect(handlerMock).toHaveBeenNthCalledWith(1, TokenType.BIGINT, 0, 3, context);
  });

  test('tokenizes nested objects', () => {
    jsonTokenizer('{"aaa":["bbb"]}', handler, context);

    expect(handlerMock).toHaveBeenCalledTimes(6);
    expect(handlerMock).toHaveBeenNthCalledWith(1, TokenType.OBJECT_START, 0, 1, context);
    expect(handlerMock).toHaveBeenNthCalledWith(2, TokenType.STRING, 1, 5, context);
    // expect(handlerMock).toHaveBeenNthCalledWith(3, TokenType.COLON, 6, 1, context);
    expect(handlerMock).toHaveBeenNthCalledWith(3, TokenType.ARRAY_START, 7, 1, context);
    expect(handlerMock).toHaveBeenNthCalledWith(4, TokenType.STRING, 8, 5, context);
    expect(handlerMock).toHaveBeenNthCalledWith(5, TokenType.ARRAY_END, 13, 1, context);
    expect(handlerMock).toHaveBeenNthCalledWith(6, TokenType.OBJECT_END, 14, 1, context);
  });

  test('reads test file', () => {
    const json = fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8');

    const state = jsonTokenizer(json, handler, context);

    expect(state.offset).toBe(json.length);
  });
});
