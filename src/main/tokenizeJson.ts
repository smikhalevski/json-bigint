import {all, char, CharCodeChecker, maybe, or, ResultCode, seq, Taker, text} from 'tokenizer-dsl';
import {CharCode} from './CharCode';
import {ErrorCode, ITokenHandler} from './types';

const isSpaceChar: CharCodeChecker = (charCode) =>
    charCode === CharCode[' ']
    || charCode === CharCode['\t']
    || charCode === CharCode['\r']
    || charCode === CharCode['\n'];

// 1-9
const isLeadingDigitChar: CharCodeChecker = (charCode) => charCode >= CharCode['1'] && charCode <= CharCode['9'];

// 0-9
const isDigitChar: CharCodeChecker = (charCode) => charCode >= CharCode['0'] && charCode <= CharCode['9'];

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

    const escI = str.indexOf('\\', i);

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

export function tokenizeJson(str: string, handler: ITokenHandler): number {
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
  } = handler;

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
        colonCallback(i++, i);
        continue;

      case CharCode[',']:
        commaCallback(i++, i);
        continue;

      case CharCode['{']:
        objectStartCallback(i++, i);
        continue;

      case CharCode['}']:
        objectEndCallback(i++, i);
        continue;

      case CharCode['[']:
        arrayStartCallback(i++, i);
        continue;

      case CharCode[']']:
        arrayEndCallback(i++, i);
        continue;
    }

    j = takeString(str, i);
    if (j < ResultCode.NO_MATCH) {
      return j;
    }
    if (j >= 0) {
      stringCallback(lastTakenStr, i, j);
      i = j;
      continue;
    }

    j = takeTrue(str, i);
    if (j >= 0) {
      trueCallback(i, j);
      i = j;
      continue;
    }

    j = takeFalse(str, i);
    if (j >= 0) {
      falseCallback(i, j);
      i = j;
      continue;
    }

    j = takeNull(str, i);
    if (j >= 0) {
      nullCallback(i, j);
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

      const data = str.substring(i, j);

      if (numberMode) {
        numberCallback(data, i, j);
      } else {
        bigIntCallback(data, i, j);
      }
      i = j;
      continue;
    }

    return ErrorCode.UNEXPECTED_TOKEN;
  }

  return i;
}
