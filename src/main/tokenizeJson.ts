import {allCharBy, char, charBy, CharCodeChecker, maybe, or, ResultCode, seq, Taker, text} from 'tokenizer-dsl';
import {CharCode} from './CharCode';

const isSpaceChar: CharCodeChecker = (c) =>
    c === 0x20
    || c === CharCode['\t']
    || c === CharCode['\r']
    || c === CharCode['\n'];

// [0-9A-Fa-f]
const isHexDigitChar: CharCodeChecker = (c) =>
    isDigitChar(c)
    || c >= CharCode['a'] && c <= CharCode['f']
    || c >= CharCode['A'] && c <= CharCode['F'];

// 1-9
const isLeadingDigitChar: CharCodeChecker = (c) => c >= CharCode['01'] && c <= CharCode['09'];

// 0-9
const isDigitChar: CharCodeChecker = (c) => c >= CharCode['00'] && c <= CharCode['09'];

// e or E
const isExponentChar: CharCodeChecker = (c) => c === CharCode['e'] || c === CharCode['E'];

// + or -
const isSignChar: CharCodeChecker = (c) => c === CharCode['+'] || c === CharCode['-'];

const takeSpace = allCharBy(isSpaceChar);

const takeMinus = maybe(char(CharCode['-']));

const takeDigits = allCharBy(isDigitChar, 1);

// 0 or -123 or 123
const takeInteger = seq(
    takeMinus,
    or(
        char(CharCode['00']),
        seq(
            charBy(isLeadingDigitChar),
            allCharBy(isDigitChar),
        ),
    ),
);

// .123
const takeFraction = seq(char(CharCode['.']), takeDigits);

// e5 or E5
const takeExponent = seq(
    charBy(isExponentChar),
    maybe(charBy(isSignChar)),
    takeDigits,
);

const takeHexInteger = allCharBy(isHexDigitChar, 4, 4);

const takeObjectStart = char(CharCode['{']);

const takeObjectEnd = char(CharCode['}']);

const takeArrayStart = char(CharCode['[']);

const takeArrayEnd = char(CharCode[']']);

const takeTrue = text('true');

const takeFalse = text('false');

const takeNull = text('null');

const takeColon = char(CharCode[':']);

const takeComma = char(CharCode[',']);

let lastString = '';

const takeString: Taker = (str, i) => {
  if (str.charCodeAt(i) !== CharCode['"']) {
    return ResultCode.NO_MATCH;
  }
  i++;

  const charCount = str.length;
  let j = i;

  lastString = '';

  while (i < charCount) {
    switch (str.charCodeAt(i)) {

      case CharCode['"']:
        lastString += str.substring(j, i);
        return i + 1;

      case CharCode['\\']:
        lastString += str.substring(j, i);

        switch (str.charCodeAt(i + 1)) {

          case CharCode['"']:
            lastString += '"';
            break;

          case CharCode['\\']:
            lastString += '\\';
            break;

          case CharCode['/']:
            lastString += '/';
            break;

          case CharCode['b']:
            lastString += '\b';
            break;

          case CharCode['n']:
            lastString += '\n';
            break;

          case CharCode['r']:
            lastString += '\r';
            break;

          case CharCode['t']:
            lastString += '\t';
            break;

          case CharCode['u']:
            const k = takeHexInteger(str, i + 2);
            if (k >= 0) {
              lastString += String.fromCharCode(parseInt(str.substring(i + 2, k), 16));
              i = j = k;
              continue;
            }

          default:
            return ResultCode.ERROR;
        }
        i += 2;
        j = i;
        break;

      default:
        i++;
    }
  }

  lastString = '';

  return ResultCode.ERROR;
};

export type DataCallback = (data: string, start: number, end: number) => void;

export type OffsetCallback = (start: number, end: number) => void;

export interface IJsonTokenizerOptions {
  onObjectStart?: OffsetCallback;
  onObjectEnd?: OffsetCallback;
  onArrayStart?: OffsetCallback;
  onArrayEnd?: OffsetCallback;
  onString?: DataCallback;
  onNumber?: DataCallback;
  onBigInt?: DataCallback;
  onTrue?: OffsetCallback;
  onFalse?: OffsetCallback;
  onNull?: OffsetCallback;
  onColon?: OffsetCallback;
  onComma?: OffsetCallback;
}

export function tokenizeJson(str: string, options: IJsonTokenizerOptions): number {
  const {
    onObjectStart,
    onObjectEnd,
    onArrayStart,
    onArrayEnd,
    onString,
    onNumber,
    onBigInt,
    onTrue,
    onFalse,
    onNull,
    onColon,
    onComma,
  } = options;

  const charCount = str.length;

  let i = 0;
  let j;

  while (i < charCount) {

    i = takeSpace(str, i);

    // No more tokens available.
    if (i === charCount) {
      break;
    }

    j = takeColon(str, i);
    if (j >= 0) {
      onColon?.(i, j);
      i = j;
      continue;
    }

    j = takeComma(str, i);
    if (j >= 0) {
      onComma?.(i, j);
      i = j;
      continue;
    }

    j = takeString(str, i);
    if (j >= 0) {
      onString?.(lastString, i, j);
      i = j;
      continue;
    }

    j = takeObjectStart(str, i);
    if (j >= 0) {
      onObjectStart?.(i, j);
      i = j;
      continue;
    }

    j = takeObjectEnd(str, i);
    if (j >= 0) {
      onObjectEnd?.(i, j);
      i = j;
      continue;
    }

    j = takeArrayStart(str, i);
    if (j >= 0) {
      onArrayStart?.(i, j);
      i = j;
      continue;
    }

    j = takeArrayEnd(str, i);
    if (j >= 0) {
      onArrayEnd?.(i, j);
      i = j;
      continue;
    }

    j = takeTrue(str, i);
    if (j >= 0) {
      onTrue?.(i, j);
      i = j;
      continue;
    }

    j = takeFalse(str, i);
    if (j >= 0) {
      onFalse?.(i, j);
      i = j;
      continue;
    }

    j = takeNull(str, i);
    if (j >= 0) {
      onNull?.(i, j);
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
        onNumber?.(str.substring(i, j), i, j);
      } else {
        onBigInt?.(str.substring(i, j), i, j);
      }
      i = j;
      continue;
    }

    return ResultCode.ERROR;
  }

  return i;
}
