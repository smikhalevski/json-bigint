import {
  allCharBy,
  char,
  charBy,
  CharCodeChecker,
  maybe,
  or,
  ResultCode,
  seq,
  Taker,
  text,
  untilText,
} from 'tokenizer-dsl';
import {CharCode} from './CharCode';
import {decode} from './decoder';

const isSpaceChar: CharCodeChecker = (charCode) =>
    charCode === 0x20
    || charCode === CharCode['\t']
    || charCode === CharCode['\r']
    || charCode === CharCode['\n'];

// 1-9
const isLeadingDigitChar: CharCodeChecker = (charCode) => charCode >= CharCode['01'] && charCode <= CharCode['09'];

// 0-9
const isDigitChar: CharCodeChecker = (charCode) => charCode >= CharCode['00'] && charCode <= CharCode['09'];

// e or E
const isExponentChar: CharCodeChecker = (charCode) => charCode === CharCode['e'] || charCode === CharCode['E'];

// + or -
const isSignChar: CharCodeChecker = (charCode) => charCode === CharCode['+'] || charCode === CharCode['-'];

const takeSpace = allCharBy(isSpaceChar);

const takeMinus = maybe(char(CharCode['-']));

const takeDigits = allCharBy(isDigitChar, {minimumCount: 1});

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

const takeTrue = text('true');

const takeFalse = text('false');

const takeNull = text('null');

const takeUntilQuote = untilText('"', {inclusive: true});

export const takeString: Taker = (str, i) => {
  if (str.charCodeAt(i) !== CharCode['"']) {
    return ResultCode.NO_MATCH;
  }
  i++;
  while (true) {
    const j = takeUntilQuote(str, i);
    if (j === ResultCode.NO_MATCH || str.charCodeAt(j - 2) !== CharCode['\\']) {
      return j;
    }
    i = j;
  }
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

    if (i === charCount) {
      break;
    }

    switch (str.charCodeAt(i)) {

      case CharCode[':']:
        onColon?.(i, i + 1);
        i++;
        continue;

      case CharCode[',']:
        onComma?.(i, i + 1);
        i++;
        continue;

      case CharCode['{']:
        onObjectStart?.(i, i + 1);
        i++;
        continue;

      case CharCode['}']:
        onObjectEnd?.(i, i + 1);
        i++;
        continue;

      case CharCode['[']:
        onArrayStart?.(i, i + 1);
        i++;
        continue;

      case CharCode[']']:
        onArrayEnd?.(i, i + 1);
        i++;
        continue;
    }

    j = takeString(str, i);
    if (j >= 0) {
      onString?.(decode(str.substring(i + 1, j - 1)), i, j);
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
