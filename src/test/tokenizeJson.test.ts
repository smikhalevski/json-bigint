import {ErrorCode, IJsonTokenizerOptions, tokenizeJson} from '../main/tokenizeJson';
import * as fs from 'fs';
import * as path from 'path';

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

  const options: IJsonTokenizerOptions<void> = {
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
    expect(tokenizeJson(null, '"abc"', options)).toBe(5);

    expect(stringMock).toHaveBeenCalledTimes(1);
    expect(stringMock).toHaveBeenCalledWith(null, 'abc', 0, 5);
  });

  test('reads strings with escaped UTF chars', () => {
    expect(tokenizeJson(null, '"abc\\u00c1abc"', options)).toBe(14);

    expect(stringMock).toHaveBeenCalledTimes(1);
    expect(stringMock).toHaveBeenCalledWith(null, 'abcÁabc', 0, 14);
  });

  test('reads strings with escaped tab', () => {
    expect(tokenizeJson(null, '"\\t"', options)).toBe(4);

    expect(stringMock).toHaveBeenCalledTimes(1);
    expect(stringMock).toHaveBeenCalledWith(null, '\t', 0, 4);
  });

  test('reads strings with escaped linefeed', () => {
    expect(tokenizeJson(null, '"\\n"', options)).toBe(4);

    expect(stringMock).toHaveBeenCalledTimes(1);
    expect(stringMock).toHaveBeenCalledWith(null, '\n', 0, 4);
  });

  test('reads strings with escaped backspace', () => {
    expect(tokenizeJson(null, '"\\b"', options)).toBe(4);

    expect(stringMock).toHaveBeenCalledTimes(1);
    expect(stringMock).toHaveBeenCalledWith(null, '\b', 0, 4);
  });

  test('reads strings with escaped solidus', () => {
    expect(tokenizeJson(null, '"\\/"', options)).toBe(4);

    expect(stringMock).toHaveBeenCalledTimes(1);
    expect(stringMock).toHaveBeenCalledWith(null, '/', 0, 4);
  });

  test('reads strings with escaped reverse solidus', () => {
    expect(tokenizeJson(null, '"\\\\"', options)).toBe(4);

    expect(stringMock).toHaveBeenCalledTimes(1);
    expect(stringMock).toHaveBeenCalledWith(null, '\\', 0, 4);
  });

  test('reads strings with escaped quotation mark', () => {
    expect(tokenizeJson(null, '"\\""', options)).toBe(4);

    expect(stringMock).toHaveBeenCalledTimes(1);
    expect(stringMock).toHaveBeenCalledWith(null, '"', 0, 4);
  });

  test('returns error for unterminated strings', () => {
    expect(tokenizeJson(null, '"abc', options)).toBe(ErrorCode.UNTERMINATED_STRING);
    expect(stringMock).not.toHaveBeenCalled();
  });

  test('returns error for invalid escaped UTF char codes', () => {
    expect(tokenizeJson(null, '"\\uqqqq"', options)).toBe(ErrorCode.INVALID_UTF_CHAR_CODE);
    expect(stringMock).not.toHaveBeenCalled();
  });

  test('returns error for illegal escaped chars', () => {
    expect(tokenizeJson(null, '"\\q"', options)).toBe(ErrorCode.ILLEGAL_ESCAPE_CHAR);
    expect(stringMock).not.toHaveBeenCalled();
  });

  test('reads zero integer value as bigint', () => {
    expect(tokenizeJson(null, '0', options)).toBe(1);

    expect(bigIntMock).toHaveBeenCalledTimes(1);
    expect(bigIntMock).toHaveBeenCalledWith(null, '0', 0, 1);
    expect(numberMock).not.toHaveBeenCalled();
  });

  test('reads one integer value as bigint', () => {
    expect(tokenizeJson(null, '1', options)).toBe(1);

    expect(bigIntMock).toHaveBeenCalledTimes(1);
    expect(bigIntMock).toHaveBeenCalledWith(null, '1', 0, 1);
    expect(numberMock).not.toHaveBeenCalled();
  });

  test('reads negative integer values as bigint', () => {
    expect(tokenizeJson(null, '-123', options)).toBe(4);

    expect(bigIntMock).toHaveBeenCalledTimes(1);
    expect(bigIntMock).toHaveBeenCalledWith(null, '-123', 0, 4);
    expect(numberMock).not.toHaveBeenCalled();
  });

  test('returns error for plus sign', () => {
    expect(tokenizeJson(null, '+123', options)).toBe(ErrorCode.UNEXPECTED_TOKEN);
    expect(tokenizeJson(null, '+123.0', options)).toBe(ErrorCode.UNEXPECTED_TOKEN);
    expect(tokenizeJson(null, '+123e5', options)).toBe(ErrorCode.UNEXPECTED_TOKEN);
    expect(tokenizeJson(null, '+123E5', options)).toBe(ErrorCode.UNEXPECTED_TOKEN);
    expect(tokenizeJson(null, '+123.123E5', options)).toBe(ErrorCode.UNEXPECTED_TOKEN);

    expect(bigIntMock).not.toHaveBeenCalled();
    expect(numberMock).not.toHaveBeenCalled();
  });

  test('reads floating point values as number', () => {
    expect(tokenizeJson(null, '0.123', options)).toBe(5);

    expect(numberMock).toHaveBeenCalledTimes(1);
    expect(numberMock).toHaveBeenCalledWith(null, '0.123', 0, 5);
    expect(bigIntMock).not.toHaveBeenCalled();
  });

  test('reads negative floating point values as number', () => {
    expect(tokenizeJson(null, '-0.123', options)).toBe(6);

    expect(numberMock).toHaveBeenCalledTimes(1);
    expect(numberMock).toHaveBeenCalledWith(null, '-0.123', 0, 6);
    expect(bigIntMock).not.toHaveBeenCalled();
  });

  test('reads exponential values as number', () => {
    expect(tokenizeJson(null, '0e123', options)).toBe(5);

    expect(numberMock).toHaveBeenCalledTimes(1);
    expect(numberMock).toHaveBeenCalledWith(null, '0e123', 0, 5);
    expect(bigIntMock).not.toHaveBeenCalled();
  });

  test('exponent char can be capital', () => {
    expect(tokenizeJson(null, '0E123', options)).toBe(5);

    expect(numberMock).toHaveBeenCalledTimes(1);
    expect(numberMock).toHaveBeenCalledWith(null, '0E123', 0, 5);
    expect(bigIntMock).not.toHaveBeenCalled();
  });

  test('reads bigint when exponent value is missing', () => {
    expect(tokenizeJson(null, '0e', options)).toBe(ErrorCode.UNEXPECTED_TOKEN);

    expect(numberMock).not.toHaveBeenCalled();
    expect(bigIntMock).toHaveBeenCalled();
  });

  test('reads exponential values with leading zeroes', () => {
    expect(tokenizeJson(null, '0e00123', options)).toBe(7);

    expect(numberMock).toHaveBeenCalledTimes(1);
    expect(numberMock).toHaveBeenCalledWith(null, '0e00123', 0, 7);
  });

  test('reads fractions and exponents at the same time', () => {
    expect(tokenizeJson(null, '123.123e00123', options)).toBe(13);

    expect(numberMock).toHaveBeenCalledTimes(1);
    expect(numberMock).toHaveBeenCalledWith(null, '123.123e00123', 0, 13);
  });

  test('reads true', () => {
    expect(tokenizeJson(null, 'true', options)).toBe(4);

    expect(trueMock).toHaveBeenCalledTimes(1);
    expect(trueMock).toHaveBeenCalledWith(null, 0, 4);
  });

  test('reads false', () => {
    expect(tokenizeJson(null, 'false', options)).toBe(5);

    expect(falseMock).toHaveBeenCalledTimes(1);
    expect(falseMock).toHaveBeenCalledWith(null, 0, 5);
  });

  test('reads null', () => {
    expect(tokenizeJson(null, 'null', options)).toBe(4);

    expect(nullMock).toHaveBeenCalledTimes(1);
    expect(nullMock).toHaveBeenCalledWith(null, 0, 4);
  });

  test('reads object start', () => {
    expect(tokenizeJson(null, '{', options)).toBe(1);

    expect(objectStartMock).toHaveBeenCalledTimes(1);
    expect(objectStartMock).toHaveBeenCalledWith(null, 0, 1);
  });

  test('reads object end', () => {
    expect(tokenizeJson(null, '}', options)).toBe(1);

    expect(objectEndMock).toHaveBeenCalledTimes(1);
    expect(objectEndMock).toHaveBeenCalledWith(null, 0, 1);
  });

  test('reads array start', () => {
    expect(tokenizeJson(null, '[', options)).toBe(1);

    expect(arrayStartMock).toHaveBeenCalledTimes(1);
    expect(arrayStartMock).toHaveBeenCalledWith(null, 0, 1);
  });

  test('reads array end', () => {
    expect(tokenizeJson(null, ']', options)).toBe(1);

    expect(arrayEndMock).toHaveBeenCalledTimes(1);
    expect(arrayEndMock).toHaveBeenCalledWith(null, 0, 1);
  });

  test('reads comma', () => {
    expect(tokenizeJson(null, ',', options)).toBe(1);

    expect(commaMock).toHaveBeenCalledTimes(1);
    expect(commaMock).toHaveBeenCalledWith(null, 0, 1);
  });

  test('reads colon', () => {
    expect(tokenizeJson(null, ':', options)).toBe(1);

    expect(colonMock).toHaveBeenCalledTimes(1);
    expect(colonMock).toHaveBeenCalledWith(null, 0, 1);
  });

  test('reads test file', () => {
    const json = fs.readFileSync(path.join(__dirname, './test.json'), 'utf8');

    expect(tokenizeJson(null, json, options)).toBe(json.length);
  });
});
