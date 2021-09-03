import {all, char, CharCodeChecker, maybe, or, ResultCode, seq, Taker, text} from 'tokenizer-dsl';
import {CharCode} from './CharCode';

export const enum ErrorCode {
  UNEXPECTED_TOKEN = -2,
  UNTERMINATED_STRING = -3,
  ILLEGAL_ESCAPE_CHAR = -4,
  INVALID_UTF_CHAR_CODE = -5,
}

const isSpaceChar: CharCodeChecker = (charCode) =>
    charCode === 32
    || charCode === CharCode['\t']
    || charCode === CharCode['\r']
    || charCode === CharCode['\n'];

// 1-9
const isLeadingDigitChar: CharCodeChecker = (charCode) => charCode >= 49 /*1*/ && charCode <= 57 /*9*/;

// 0-9
const isDigitChar: CharCodeChecker = (charCode) => charCode >= 48 /*0*/ && charCode <= 57 /*9*/;

// e or E
const isExponentChar: CharCodeChecker = (charCode) => charCode === CharCode['e'] || charCode === CharCode['E'];

// + or -
const isSignChar: CharCodeChecker = (charCode) => charCode === CharCode['+'] || charCode === CharCode['-'];

const takeSpace = all(char(isSpaceChar));

const takeZeroOrManyDigits = all(char(isDigitChar));

const takeOneOrManyDigits = all(char(isDigitChar), {minimumCount: 1});

// 0 or -123 or 123
const takeInteger = seq(
    maybe(text('-')),
    or(
        text('0'),
        seq(
            char(isLeadingDigitChar),
            takeZeroOrManyDigits,
        ),
    ),
);

// .123
const takeFraction = seq(text('.'), takeOneOrManyDigits);

// e5 or E5
const takeExponent = seq(
    char(isExponentChar),
    maybe(char(isSignChar)),
    takeOneOrManyDigits,
);

const takeTrue = text('true');

const takeFalse = text('false');

const takeNull = text('null');

let lastTakenStr = '';

export const takeString: Taker = (str, i) => {
  if (str.charCodeAt(i) !== CharCode['"']) {
    return ResultCode.NO_MATCH;
  }
  i++;

  let quotI = str.indexOf('"', i);
  let takenStr = '';

  if (quotI === -1) {
    return ErrorCode.UNTERMINATED_STRING;
  }
  if (quotI === i) {
    lastTakenStr = takenStr;
    return quotI + 1;
  }

  while (true) {

    let escI = str.indexOf('\\', i);

    if (escI === -1 || escI > quotI) {
      lastTakenStr = takenStr + str.substring(i, quotI);
      return quotI + 1;
    }

    const chunkStr = str.substring(i, escI);

    switch (str.charCodeAt(escI + 1)) {

      case CharCode['"']:
        takenStr += chunkStr + '"';
        i = escI + 2;
        break;

      case CharCode['\\']:
        takenStr += chunkStr + '\\';
        i = escI + 2;
        break;

      case CharCode['/']:
        takenStr += chunkStr + '/';
        i = escI + 2;
        break;

      case CharCode['b']:
        takenStr += chunkStr + '\b';
        i = escI + 2;
        break;

      case CharCode['t']:
        takenStr += chunkStr + '\t';
        i = escI + 2;
        break;

      case CharCode['n']:
        takenStr += chunkStr + '\n';
        i = escI + 2;
        break;

      case CharCode['f']:
        takenStr += chunkStr + '\f';
        i = escI + 2;
        break;

      case CharCode['r']:
        takenStr += chunkStr + '\r';
        i = escI + 2;
        break;

      case CharCode['u']:
        const charCode = parseInt(str.substr(escI + 2, 4), 16);

        if (isNaN(charCode)) {
          return ErrorCode.INVALID_UTF_CHAR_CODE;
        }
        takenStr += chunkStr + String.fromCharCode(charCode);
        i = escI + 6;
        break;

      default:
        return ErrorCode.ILLEGAL_ESCAPE_CHAR;
    }

    if (i > quotI) {
      quotI = str.indexOf('"', i);

      if (quotI === -1) {
        return ErrorCode.UNTERMINATED_STRING;
      }
    }
  }
};

export interface IJsonTokenizerOptions<Context> {

  objectStart(context: Context, start: number, end: number): void;

  objectEnd(context: Context, start: number, end: number): void;

  arrayStart(context: Context, start: number, end: number): void;

  arrayEnd(context: Context, start: number, end: number): void;

  string(context: Context, data: string, start: number, end: number): void;

  number(context: Context, data: string, start: number, end: number): void;

  bigInt(context: Context, data: string, start: number, end: number): void;

  true(context: Context, start: number, end: number): void;

  false(context: Context, start: number, end: number): void;

  null(context: Context, start: number, end: number): void;

  colon(context: Context, start: number, end: number): void;

  comma(context: Context, start: number, end: number): void;
}

export function tokenizeJson<Context>(context: Context, str: string, options: IJsonTokenizerOptions<Context>): number {
  const {
    objectStart: objectStartCallback,
    objectEnd: objectEndCallback,
    arrayStart: arrayStartCallback,
    arrayEnd: arrayEndCallback,
    string: stringCallback,
    number: numberCallback,
    bigInt: bigIntCallback,
    true: trueCallback,
    false: falseCallback,
    null: nullCallback,
    colon: colonCallback,
    comma: commaCallback,
  } = options;

  const charCount = str.length;

  let i = 0;
  let j;

  while (i < charCount) {

    i = takeSpace(str, i);

    if (i === charCount) {
      break;
    }

    switch (str.charCodeAt(i)) {

      case CharCode[':']:
        colonCallback(context, i++, i);
        continue;

      case CharCode[',']:
        commaCallback(context, i++, i);
        continue;

      case CharCode['{']:
        objectStartCallback(context, i++, i);
        continue;

      case CharCode['}']:
        objectEndCallback(context, i++, i);
        continue;

      case CharCode['[']:
        arrayStartCallback(context, i++, i);
        continue;

      case CharCode[']']:
        arrayEndCallback(context, i++, i);
        continue;
    }

    j = takeString(str, i);
    if (j < ResultCode.NO_MATCH) {
      return j;
    }
    if (j >= 0) {
      stringCallback(context, lastTakenStr, i, j);
      i = j;
      continue;
    }

    j = takeTrue(str, i);
    if (j >= 0) {
      trueCallback(context, i, j);
      i = j;
      continue;
    }

    j = takeFalse(str, i);
    if (j >= 0) {
      falseCallback(context, i, j);
      i = j;
      continue;
    }

    j = takeNull(str, i);
    if (j >= 0) {
      nullCallback(context, i, j);
      i = j;
      continue;
    }

    j = takeInteger(str, i);
    if (j >= 0) {
      let k;
      let numberMode = false;

      k = takeFraction(str, j);
      if (k >= 0) {
        numberMode = true;
        j = k;
      }

      k = takeExponent(str, j);
      if (k >= 0) {
        numberMode = true;
        j = k;
      }

      if (numberMode) {
        numberCallback(context, str.substring(i, j), i, j);
      } else {
        bigIntCallback(context, str.substring(i, j), i, j);
      }
      i = j;
      continue;
    }

    return ErrorCode.UNEXPECTED_TOKEN;
  }

  return i;
}
