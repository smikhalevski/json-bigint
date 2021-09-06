import {tokenizeJson} from '../main/tokenizeJson';
import * as fs from 'fs';
import * as path from 'path';
import {ErrorCode, ITokenHandler} from '../main/types';

describe('tokenizeJson', () => {

  const objectStartMock = jest.fn();
  const objectEndMock = jest.fn();
  const arrayStartMock = jest.fn();
  const arrayEndMock = jest.fn();
  const stringMock = jest.fn();
  const numberMock = jest.fn();
  const bigIntMock = jest.fn();
  const trueMock = jest.fn();
  const falseMock = jest.fn();
  const nullMock = jest.fn();
  const colonMock = jest.fn();
  const commaMock = jest.fn();

  const handler: ITokenHandler = {
    objectStart: objectStartMock,
    objectEnd: objectEndMock,
    arrayStart: arrayStartMock,
    arrayEnd: arrayEndMock,
    string: stringMock,
    number: numberMock,
    bigInt: bigIntMock,
    true: trueMock,
    false: falseMock,
    null: nullMock,
    colon: colonMock,
    comma: commaMock,
  };

  beforeEach(() => {
    objectStartMock.mockReset();
    objectEndMock.mockReset();
    arrayStartMock.mockReset();
    arrayEndMock.mockReset();
    stringMock.mockReset();
    numberMock.mockReset();
    bigIntMock.mockReset();
    trueMock.mockReset();
    falseMock.mockReset();
    nullMock.mockReset();
    colonMock.mockReset();
    commaMock.mockReset();
  });

  test('reads strings', () => {
    expect(tokenizeJson('"abc"', handler)).toBe(5);

    expect(stringMock).toHaveBeenCalledTimes(1);
    expect(stringMock).toHaveBeenCalledWith('abc', 0, 5);
  });

  test('reads strings with escaped UTF chars', () => {
    expect(tokenizeJson('"abc\\u00c1abc"', handler)).toBe(14);

    expect(stringMock).toHaveBeenCalledTimes(1);
    expect(stringMock).toHaveBeenCalledWith('abcÁabc', 0, 14);
  });

  test('reads strings with escaped tab', () => {
    expect(tokenizeJson('"\\t"', handler)).toBe(4);

    expect(stringMock).toHaveBeenCalledTimes(1);
    expect(stringMock).toHaveBeenCalledWith('\t', 0, 4);
  });

  test('reads strings with escaped linefeed', () => {
    expect(tokenizeJson('"\\n"', handler)).toBe(4);

    expect(stringMock).toHaveBeenCalledTimes(1);
    expect(stringMock).toHaveBeenCalledWith('\n', 0, 4);
  });

  test('reads strings with escaped backspace', () => {
    expect(tokenizeJson('"\\b"', handler)).toBe(4);

    expect(stringMock).toHaveBeenCalledTimes(1);
    expect(stringMock).toHaveBeenCalledWith('\b', 0, 4);
  });

  test('reads strings with escaped solidus', () => {
    expect(tokenizeJson('"\\/"', handler)).toBe(4);

    expect(stringMock).toHaveBeenCalledTimes(1);
    expect(stringMock).toHaveBeenCalledWith('/', 0, 4);
  });

  test('reads strings with escaped reverse solidus', () => {
    expect(tokenizeJson('"\\\\"', handler)).toBe(4);

    expect(stringMock).toHaveBeenCalledTimes(1);
    expect(stringMock).toHaveBeenCalledWith('\\', 0, 4);
  });

  test('reads strings with escaped quotation mark', () => {
    expect(tokenizeJson('"\\""', handler)).toBe(4);

    expect(stringMock).toHaveBeenCalledTimes(1);
    expect(stringMock).toHaveBeenCalledWith('"', 0, 4);
  });

  test('returns error for unterminated strings', () => {
    expect(tokenizeJson('"abc', handler)).toBe(ErrorCode.UNTERMINATED_STRING);
    expect(stringMock).not.toHaveBeenCalled();
  });

  test('returns error for invalid escaped UTF char codes', () => {
    expect(tokenizeJson('"\\uqqqq"', handler)).toBe(ErrorCode.INVALID_UTF_CHAR_CODE);
    expect(stringMock).not.toHaveBeenCalled();
  });

  test('returns error for illegal escaped chars', () => {
    expect(tokenizeJson('"\\q"', handler)).toBe(ErrorCode.ILLEGAL_ESCAPE_CHAR);
    expect(stringMock).not.toHaveBeenCalled();
  });

  test('reads zero integer value as bigint', () => {
    expect(tokenizeJson('0', handler)).toBe(1);

    expect(bigIntMock).toHaveBeenCalledTimes(1);
    expect(bigIntMock).toHaveBeenCalledWith('0', 0, 1);
    expect(numberMock).not.toHaveBeenCalled();
  });

  test('reads one integer value as bigint', () => {
    expect(tokenizeJson('1', handler)).toBe(1);

    expect(bigIntMock).toHaveBeenCalledTimes(1);
    expect(bigIntMock).toHaveBeenCalledWith('1', 0, 1);
    expect(numberMock).not.toHaveBeenCalled();
  });

  test('reads negative integer values as bigint', () => {
    expect(tokenizeJson('-123', handler)).toBe(4);

    expect(bigIntMock).toHaveBeenCalledTimes(1);
    expect(bigIntMock).toHaveBeenCalledWith('-123', 0, 4);
    expect(numberMock).not.toHaveBeenCalled();
  });

  test('returns error for plus sign', () => {
    expect(tokenizeJson('+123', handler)).toBe(ErrorCode.UNEXPECTED_TOKEN);
    expect(tokenizeJson('+123.0', handler)).toBe(ErrorCode.UNEXPECTED_TOKEN);
    expect(tokenizeJson('+123e5', handler)).toBe(ErrorCode.UNEXPECTED_TOKEN);
    expect(tokenizeJson('+123E5', handler)).toBe(ErrorCode.UNEXPECTED_TOKEN);
    expect(tokenizeJson('+123.123E5', handler)).toBe(ErrorCode.UNEXPECTED_TOKEN);

    expect(bigIntMock).not.toHaveBeenCalled();
    expect(numberMock).not.toHaveBeenCalled();
  });

  test('reads floating point values as number', () => {
    expect(tokenizeJson('0.123', handler)).toBe(5);

    expect(numberMock).toHaveBeenCalledTimes(1);
    expect(numberMock).toHaveBeenCalledWith('0.123', 0, 5);
    expect(bigIntMock).not.toHaveBeenCalled();
  });

  test('reads negative floating point values as number', () => {
    expect(tokenizeJson('-0.123', handler)).toBe(6);

    expect(numberMock).toHaveBeenCalledTimes(1);
    expect(numberMock).toHaveBeenCalledWith('-0.123', 0, 6);
    expect(bigIntMock).not.toHaveBeenCalled();
  });

  test('reads exponential values as number', () => {
    expect(tokenizeJson('0e123', handler)).toBe(5);

    expect(numberMock).toHaveBeenCalledTimes(1);
    expect(numberMock).toHaveBeenCalledWith('0e123', 0, 5);
    expect(bigIntMock).not.toHaveBeenCalled();
  });

  test('exponent char can be capital', () => {
    expect(tokenizeJson('0E123', handler)).toBe(5);

    expect(numberMock).toHaveBeenCalledTimes(1);
    expect(numberMock).toHaveBeenCalledWith('0E123', 0, 5);
    expect(bigIntMock).not.toHaveBeenCalled();
  });

  test('reads bigint when exponent value is missing', () => {
    expect(tokenizeJson('0e', handler)).toBe(ErrorCode.UNEXPECTED_TOKEN);

    expect(numberMock).not.toHaveBeenCalled();
    expect(bigIntMock).toHaveBeenCalled();
  });

  test('reads exponential values with leading zeroes', () => {
    expect(tokenizeJson('0e00123', handler)).toBe(7);

    expect(numberMock).toHaveBeenCalledTimes(1);
    expect(numberMock).toHaveBeenCalledWith('0e00123', 0, 7);
  });

  test('reads fractions and exponents at the same time', () => {
    expect(tokenizeJson('123.123e00123', handler)).toBe(13);

    expect(numberMock).toHaveBeenCalledTimes(1);
    expect(numberMock).toHaveBeenCalledWith('123.123e00123', 0, 13);
  });

  test('reads true', () => {
    expect(tokenizeJson('true', handler)).toBe(4);

    expect(trueMock).toHaveBeenCalledTimes(1);
    expect(trueMock).toHaveBeenCalledWith(0, 4);
  });

  test('reads false', () => {
    expect(tokenizeJson('false', handler)).toBe(5);

    expect(falseMock).toHaveBeenCalledTimes(1);
    expect(falseMock).toHaveBeenCalledWith(0, 5);
  });

  test('reads null', () => {
    expect(tokenizeJson('null', handler)).toBe(4);

    expect(nullMock).toHaveBeenCalledTimes(1);
    expect(nullMock).toHaveBeenCalledWith(0, 4);
  });

  test('reads object start', () => {
    expect(tokenizeJson('{', handler)).toBe(1);

    expect(objectStartMock).toHaveBeenCalledTimes(1);
    expect(objectStartMock).toHaveBeenCalledWith(0, 1);
  });

  test('reads object end', () => {
    expect(tokenizeJson('}', handler)).toBe(1);

    expect(objectEndMock).toHaveBeenCalledTimes(1);
    expect(objectEndMock).toHaveBeenCalledWith(0, 1);
  });

  test('reads array start', () => {
    expect(tokenizeJson('[', handler)).toBe(1);

    expect(arrayStartMock).toHaveBeenCalledTimes(1);
    expect(arrayStartMock).toHaveBeenCalledWith(0, 1);
  });

  test('reads array end', () => {
    expect(tokenizeJson(']', handler)).toBe(1);

    expect(arrayEndMock).toHaveBeenCalledTimes(1);
    expect(arrayEndMock).toHaveBeenCalledWith(0, 1);
  });

  test('reads comma', () => {
    expect(tokenizeJson(',', handler)).toBe(1);

    expect(commaMock).toHaveBeenCalledTimes(1);
    expect(commaMock).toHaveBeenCalledWith(0, 1);
  });

  test('reads colon', () => {
    expect(tokenizeJson(':', handler)).toBe(1);

    expect(colonMock).toHaveBeenCalledTimes(1);
    expect(colonMock).toHaveBeenCalledWith(0, 1);
  });

  test('reads test file', () => {
    const json = fs.readFileSync(path.join(__dirname, './test.json'), 'utf8');

    expect(tokenizeJson(json, handler)).toBe(json.length);
  });
});
