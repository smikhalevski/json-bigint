import {TokenHandler} from 'tokenizer-dsl';
import {ParserContext} from '../main/parseJson';
import {jsonTokenizer, Type} from '../main/jsonTokenizer';

describe('jsonTokenizer', () => {

  const tokenCallbackMock = jest.fn();
  const errorCallbackMock = jest.fn();
  const unrecognizedTokenCallbackMock = jest.fn();

  const context: ParserContext = {} as any;

  let handler: TokenHandler<Type, ParserContext>;

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
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(1, Type.OBJECT_START, 0, 1, context);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(2, Type.OBJECT_END, 1, 1, context);
  });

  test('tokenizes object with a key', () => {
    jsonTokenizer('{"aaa": "bbb"}', handler, context);

    expect(tokenCallbackMock).toHaveBeenCalledTimes(5);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(1, Type.OBJECT_START, 0, 1, context);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(2, Type.STRING, 1, 5, context);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(3, Type.COLON, 6, 1, context);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(4, Type.STRING, 8, 5, context);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(5, Type.OBJECT_END, 13, 1, context);
  });

  test('tokenizes arrays', () => {
    jsonTokenizer('[]', handler, context);

    expect(tokenCallbackMock).toHaveBeenCalledTimes(2);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(1, Type.ARRAY_START, 0, 1, context);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(2, Type.ARRAY_END, 1, 1, context);
  });

  test('tokenizes floating number', () => {
    jsonTokenizer('123.123', handler, context);

    expect(tokenCallbackMock).toHaveBeenCalledTimes(1);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(1, Type.NUMBER, 0, 7, context);
  });

  test('tokenizes negative floating number', () => {
    jsonTokenizer('-123.123', handler, context);

    expect(tokenCallbackMock).toHaveBeenCalledTimes(1);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(1, Type.NUMBER, 0, 8, context);
  });

  test('tokenizes exponential number', () => {
    jsonTokenizer('123e5', handler, context);

    expect(tokenCallbackMock).toHaveBeenCalledTimes(1);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(1, Type.NUMBER, 0, 5, context);
  });

  test('tokenizes negative exponential number', () => {
    jsonTokenizer('-123e5', handler, context);

    expect(tokenCallbackMock).toHaveBeenCalledTimes(1);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(1, Type.NUMBER, 0, 6, context);
  });

  test('tokenizes exponential number with negative power', () => {
    jsonTokenizer('123e-5', handler, context);

    expect(tokenCallbackMock).toHaveBeenCalledTimes(1);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(1, Type.NUMBER, 0, 6, context);
  });

  test('tokenizes bigint', () => {
    jsonTokenizer('123', handler, context);

    expect(tokenCallbackMock).toHaveBeenCalledTimes(1);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(1, Type.BIGINT, 0, 3, context);
  });

  test('tokenizes nested objects', () => {
    jsonTokenizer('{"aaa":["bbb"]}', handler, context);

    expect(tokenCallbackMock).toHaveBeenCalledTimes(7);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(1, Type.OBJECT_START, 0, 1, context);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(2, Type.STRING, 1, 5, context);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(3, Type.COLON, 6, 1, context);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(4, Type.ARRAY_START, 7, 1, context);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(5, Type.STRING, 8, 5, context);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(6, Type.ARRAY_END, 13, 1, context);
    expect(tokenCallbackMock).toHaveBeenNthCalledWith(7, Type.OBJECT_END, 14, 1, context);
  });
});
