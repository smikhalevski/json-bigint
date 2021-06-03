import {IJsonTokenizerOptions, tokenizeJson} from '../main/tokenizeJson';
import {ResultCode} from '../../../tokenizer-dsl';

describe('tokenizeJson', () => {

  const onObjectStartMock = jest.fn();
  const onObjectEndMock = jest.fn();
  const onArrayStartMock = jest.fn();
  const onArrayEndMock = jest.fn();
  const onStringMock = jest.fn();
  const onNumberMock = jest.fn();
  const onBigIntMock = jest.fn();
  const onTrueMock = jest.fn();
  const onFalseMock = jest.fn();
  const onNullMock = jest.fn();
  const onColonMock = jest.fn();
  const onCommaMock = jest.fn();

  const options: IJsonTokenizerOptions = {
    onObjectStart: onObjectStartMock,
    onObjectEnd: onObjectEndMock,
    onArrayStart: onArrayStartMock,
    onArrayEnd: onArrayEndMock,
    onString: onStringMock,
    onNumber: onNumberMock,
    onBigInt: onBigIntMock,
    onTrue: onTrueMock,
    onFalse: onFalseMock,
    onNull: onNullMock,
    onColon: onColonMock,
    onComma: onCommaMock,
  };

  beforeEach(() => {
    onObjectStartMock.mockReset();
    onObjectEndMock.mockReset();
    onArrayStartMock.mockReset();
    onArrayEndMock.mockReset();
    onStringMock.mockReset();
    onNumberMock.mockReset();
    onBigIntMock.mockReset();
    onTrueMock.mockReset();
    onFalseMock.mockReset();
    onNullMock.mockReset();
    onColonMock.mockReset();
    onCommaMock.mockReset();
  });

  test('reads strings', () => {
    expect(tokenizeJson('"abc"', options)).toBe(5);

    expect(onStringMock).toHaveBeenCalledTimes(1);
    expect(onStringMock).toHaveBeenCalledWith('abc', 0, 5);
  });

  test('reads strings with escaped UTF chars', () => {
    expect(tokenizeJson('"abc\\u00c1abc"', options)).toBe(14);

    expect(onStringMock).toHaveBeenCalledTimes(1);
    expect(onStringMock).toHaveBeenCalledWith('abc\u00c1abc', 0, 14);
  });

  test('reads strings with escaped tab', () => {
    expect(tokenizeJson('"\\t"', options)).toBe(4);

    expect(onStringMock).toHaveBeenCalledTimes(1);
    expect(onStringMock).toHaveBeenCalledWith('\t', 0, 4);
  });

  test('reads strings with escaped linefeed', () => {
    expect(tokenizeJson('"\\n"', options)).toBe(4);

    expect(onStringMock).toHaveBeenCalledTimes(1);
    expect(onStringMock).toHaveBeenCalledWith('\n', 0, 4);
  });

  test('reads strings with escaped backspace', () => {
    expect(tokenizeJson('"\\b"', options)).toBe(4);

    expect(onStringMock).toHaveBeenCalledTimes(1);
    expect(onStringMock).toHaveBeenCalledWith('\b', 0, 4);
  });

  test('reads strings with escaped solidus', () => {
    expect(tokenizeJson('"\\/"', options)).toBe(4);

    expect(onStringMock).toHaveBeenCalledTimes(1);
    expect(onStringMock).toHaveBeenCalledWith('/', 0, 4);
  });

  test('reads strings with escaped reverse solidus', () => {
    expect(tokenizeJson('"\\\\"', options)).toBe(4);

    expect(onStringMock).toHaveBeenCalledTimes(1);
    expect(onStringMock).toHaveBeenCalledWith('\\', 0, 4);
  });

  test('reads strings with escaped quotation mark', () => {
    expect(tokenizeJson('"\\""', options)).toBe(4);

    expect(onStringMock).toHaveBeenCalledTimes(1);
    expect(onStringMock).toHaveBeenCalledWith('"', 0, 4);
  });

  test('returns error for unterminated strings', () => {
    expect(tokenizeJson('"abc', options)).toBe(ResultCode.ERROR);
    expect(onStringMock).not.toHaveBeenCalled();
  });

  test('returns error for illegal escaped UTF chars', () => {
    expect(tokenizeJson('"\\uqqqq"', options)).toBe(ResultCode.ERROR);
    expect(onStringMock).not.toHaveBeenCalled();
  });

  test('returns error for illegal escaped chars', () => {
    expect(tokenizeJson('"\\q"', options)).toBe(ResultCode.ERROR);
    expect(onStringMock).not.toHaveBeenCalled();
  });

  test('reads zero integer value as bigint', () => {
    expect(tokenizeJson('0', options)).toBe(1);

    expect(onBigIntMock).toHaveBeenCalledTimes(1);
    expect(onBigIntMock).toHaveBeenCalledWith('0', 0, 1);
    expect(onNumberMock).not.toHaveBeenCalled();
  });

  test('reads one integer value as bigint', () => {
    expect(tokenizeJson('1', options)).toBe(1);

    expect(onBigIntMock).toHaveBeenCalledTimes(1);
    expect(onBigIntMock).toHaveBeenCalledWith('1', 0, 1);
    expect(onNumberMock).not.toHaveBeenCalled();
  });

  test('reads negative integer values as bigint', () => {
    expect(tokenizeJson('-123', options)).toBe(4);

    expect(onBigIntMock).toHaveBeenCalledTimes(1);
    expect(onBigIntMock).toHaveBeenCalledWith('-123', 0, 4);
    expect(onNumberMock).not.toHaveBeenCalled();
  });

  test('returns error for plus sign', () => {
    expect(tokenizeJson('+123', options)).toBe(ResultCode.ERROR);
    expect(tokenizeJson('+123.0', options)).toBe(ResultCode.ERROR);
    expect(tokenizeJson('+123e5', options)).toBe(ResultCode.ERROR);
    expect(tokenizeJson('+123E5', options)).toBe(ResultCode.ERROR);
    expect(tokenizeJson('+123.123E5', options)).toBe(ResultCode.ERROR);

    expect(onBigIntMock).not.toHaveBeenCalled();
    expect(onNumberMock).not.toHaveBeenCalled();
  });

  test('reads floating point values as number', () => {
    expect(tokenizeJson('0.123', options)).toBe(5);

    expect(onNumberMock).toHaveBeenCalledTimes(1);
    expect(onNumberMock).toHaveBeenCalledWith('0.123', 0, 5);
    expect(onBigIntMock).not.toHaveBeenCalled();
  });

  test('reads negative floating point values as number', () => {
    expect(tokenizeJson('-0.123', options)).toBe(6);

    expect(onNumberMock).toHaveBeenCalledTimes(1);
    expect(onNumberMock).toHaveBeenCalledWith('-0.123', 0, 6);
    expect(onBigIntMock).not.toHaveBeenCalled();
  });

  test('reads exponential values as number', () => {
    expect(tokenizeJson('0e123', options)).toBe(5);

    expect(onNumberMock).toHaveBeenCalledTimes(1);
    expect(onNumberMock).toHaveBeenCalledWith('0e123', 0, 5);
    expect(onBigIntMock).not.toHaveBeenCalled();
  });

  test('exponent char can be capital', () => {
    expect(tokenizeJson('0E123', options)).toBe(5);

    expect(onNumberMock).toHaveBeenCalledTimes(1);
    expect(onNumberMock).toHaveBeenCalledWith('0E123', 0, 5);
    expect(onBigIntMock).not.toHaveBeenCalled();
  });

  test('reads bigint when exponent value is missing', () => {
    expect(tokenizeJson('0e', options)).toBe(ResultCode.ERROR);

    expect(onNumberMock).not.toHaveBeenCalled();
    expect(onBigIntMock).toHaveBeenCalled();
  });

  test('reads exponential values with leading zeroes in exponent', () => {
    expect(tokenizeJson('0e00123', options)).toBe(7);

    expect(onNumberMock).toHaveBeenCalledTimes(1);
    expect(onNumberMock).toHaveBeenCalledWith('0e00123', 0, 7);
  });

  test('reads fractions and exponents at the same time', () => {
    expect(tokenizeJson('123.123e00123', options)).toBe(13);

    expect(onNumberMock).toHaveBeenCalledTimes(1);
    expect(onNumberMock).toHaveBeenCalledWith('123.123e00123', 0, 13);
  });

  test('reads true', () => {
    expect(tokenizeJson('true', options)).toBe(4);

    expect(onTrueMock).toHaveBeenCalledTimes(1);
    expect(onTrueMock).toHaveBeenCalledWith(0, 4);
  });

  test('reads false', () => {
    expect(tokenizeJson('false', options)).toBe(5);

    expect(onFalseMock).toHaveBeenCalledTimes(1);
    expect(onFalseMock).toHaveBeenCalledWith(0, 5);
  });

  test('reads null', () => {
    expect(tokenizeJson('null', options)).toBe(4);

    expect(onNullMock).toHaveBeenCalledTimes(1);
    expect(onNullMock).toHaveBeenCalledWith(0, 4);
  });

  test('reads object start', () => {
    expect(tokenizeJson('{', options)).toBe(1);

    expect(onObjectStartMock).toHaveBeenCalledTimes(1);
    expect(onObjectStartMock).toHaveBeenCalledWith(0, 1);
  });

  test('reads object end', () => {
    expect(tokenizeJson('}', options)).toBe(1);

    expect(onObjectEndMock).toHaveBeenCalledTimes(1);
    expect(onObjectEndMock).toHaveBeenCalledWith(0, 1);
  });

  test('reads array start', () => {
    expect(tokenizeJson('[', options)).toBe(1);

    expect(onArrayStartMock).toHaveBeenCalledTimes(1);
    expect(onArrayStartMock).toHaveBeenCalledWith(0, 1);
  });

  test('reads array end', () => {
    expect(tokenizeJson(']', options)).toBe(1);

    expect(onArrayEndMock).toHaveBeenCalledTimes(1);
    expect(onArrayEndMock).toHaveBeenCalledWith(0, 1);
  });

  test('reads comma', () => {
    expect(tokenizeJson(',', options)).toBe(1);

    expect(onCommaMock).toHaveBeenCalledTimes(1);
    expect(onCommaMock).toHaveBeenCalledWith(0, 1);
  });

  test('reads colon', () => {
    expect(tokenizeJson(':', options)).toBe(1);

    expect(onColonMock).toHaveBeenCalledTimes(1);
    expect(onColonMock).toHaveBeenCalledWith(0, 1);
  });
});
