import * as fs from 'fs';
import * as path from 'path';
import {TokenHandler} from 'tokenizer-dsl';
import {jsonTokenizer, TokenType} from '../main/jsonTokenizer';
import {ParserContext} from '../main/parser-types';

describe('jsonTokenizer', () => {

  const tokenCallbackMock = jest.fn();
  const errorCallbackMock = jest.fn();
  const unrecognizedTokenCallbackMock = jest.fn();

  const context: ParserContext = {} as any;

  let handler: TokenHandler<TokenType, ParserContext>;

  beforeEach(() => {
    tokenCallbackMock.mockReset();
    errorCallbackMock.mockReset();
    unrecognizedTokenCallbackMock.mockReset();

    handler = {
      token: tokenCallbackMock,
      error: errorCallbackMock,
      unrecognizedToken: unrecognizedTokenCallbackMock,
    };
  });

  test('tokenizes objects', () => {
    jsonTokenizer('{}', handler, context);

    expect(tokenCallbackMock).toHaveBeenCalledTimes(2);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(1, TokenType.OBJECT_START, 0, 1, context);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(2, TokenType.OBJECT_END, 1, 1, context);
  });

  test('tokenizes object with a key', () => {
    jsonTokenizer('{"aaa": "bbb"}', handler, context);

    expect(tokenCallbackMock).toHaveBeenCalledTimes(5);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(1, TokenType.OBJECT_START, 0, 1, context);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(2, TokenType.STRING, 1, 5, context);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(3, TokenType.COLON, 6, 1, context);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(4, TokenType.STRING, 8, 5, context);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(5, TokenType.OBJECT_END, 13, 1, context);
  });

  test('tokenizes arrays', () => {
    jsonTokenizer('[]', handler, context);

    expect(tokenCallbackMock).toHaveBeenCalledTimes(2);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(1, TokenType.ARRAY_START, 0, 1, context);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(2, TokenType.ARRAY_END, 1, 1, context);
  });

  test('tokenizes arrays with numbers', () => {
    jsonTokenizer('[111,222]', handler, context);

    expect(tokenCallbackMock).toHaveBeenCalledTimes(5);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(1, TokenType.ARRAY_START, 0, 1, context);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(2, TokenType.BIGINT, 1, 3, context);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(3, TokenType.COMMA, 4, 1, context);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(4, TokenType.BIGINT, 5, 3, context);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(5, TokenType.ARRAY_END, 8, 1, context);
  });

  test('tokenizes floating number', () => {
    jsonTokenizer('123.123', handler, context);

    expect(tokenCallbackMock).toHaveBeenCalledTimes(1);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(1, TokenType.NUMBER, 0, 7, context);
  });

  test('tokenizes negative floating number', () => {
    jsonTokenizer('-123.123', handler, context);

    expect(tokenCallbackMock).toHaveBeenCalledTimes(1);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(1, TokenType.NUMBER, 0, 8, context);
  });

  test('tokenizes exponential number', () => {
    jsonTokenizer('123e5', handler, context);

    expect(tokenCallbackMock).toHaveBeenCalledTimes(1);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(1, TokenType.NUMBER, 0, 5, context);
  });

  test('tokenizes negative exponential number', () => {
    jsonTokenizer('-123e5', handler, context);

    expect(tokenCallbackMock).toHaveBeenCalledTimes(1);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(1, TokenType.NUMBER, 0, 6, context);
  });

  test('tokenizes exponential number with negative power', () => {
    jsonTokenizer('123e-5', handler, context);

    expect(tokenCallbackMock).toHaveBeenCalledTimes(1);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(1, TokenType.NUMBER, 0, 6, context);
  });

  test('tokenizes bigint', () => {
    jsonTokenizer('123', handler, context);

    expect(tokenCallbackMock).toHaveBeenCalledTimes(1);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(1, TokenType.BIGINT, 0, 3, context);
  });

  test('tokenizes nested objects', () => {
    jsonTokenizer('{"aaa":["bbb"]}', handler, context);

    expect(tokenCallbackMock).toHaveBeenCalledTimes(7);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(1, TokenType.OBJECT_START, 0, 1, context);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(2, TokenType.STRING, 1, 5, context);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(3, TokenType.COLON, 6, 1, context);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(4, TokenType.ARRAY_START, 7, 1, context);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(5, TokenType.STRING, 8, 5, context);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(6, TokenType.ARRAY_END, 13, 1, context);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(7, TokenType.OBJECT_END, 14, 1, context);
  });

  test('reads test file', () => {
    const json = fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8');

    const state = jsonTokenizer(json, handler, context);

    expect(state.offset).toBe(json.length);
  });
});
