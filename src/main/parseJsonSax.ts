import {allCharBy, char, charBy, CharCodeChecker, maybe, or, seq, substr, untilSubstr} from './parser-dsl';
import {CharCode} from './parser-utils';

const isSpaceChar: CharCodeChecker = (c) => c === 0x20 || c === 0x09 || c === 0xD || c === 0xA;

// 1-9
const isNonZeroDigitChar: CharCodeChecker = (c) => c >= 49 && c <= 57;

// 0-9
const isDigitChar: CharCodeChecker = (c) => c >= 48 && c <= 57;

// e or E
const isExponentChar: CharCodeChecker = (c) => c === 101 || c === 69;

// + or -
const isSignChar: CharCodeChecker = (c) => c === 43 || c === 45;

// "okay"
const takeString = seq(char(CharCode.QUOT), untilSubstr('"', true, true));


const takeSpace = allCharBy(isSpaceChar);

const takeComma = seq(takeSpace, char(CharCode.COMMA), takeSpace);

const takeNumber = seq(
    maybe(char(CharCode.MINUS)),
    or(
        char(CharCode.ZERO),
        seq(charBy(isNonZeroDigitChar), allCharBy(isDigitChar)),
    ),
    maybe(seq(
        char(CharCode.DOT),
        allCharBy(isDigitChar),
    )),
    maybe(seq(
        charBy(isExponentChar),
        charBy(isSignChar),
        allCharBy(isDigitChar),
    )),
);

const takeObjectStart = char(CharCode.LCUB);
const takeObjectEnd = char(CharCode.RCUB);

const takeArrayStart = char(CharCode.LSQB);
const takeArrayEnd = char(CharCode.RSQB);

const takeTrue = substr('true');
const takeFalse = substr('false');
const takeNull = substr('null');





export type DataCallback = (data: string, start: number, end: number) => void;

export type OffsetCallback = (start: number, end: number) => void;

export interface SaxJsonParserOptions {
  onStartObject?: OffsetCallback;
  onEndObject?: OffsetCallback;
  onStartArray?: OffsetCallback;
  onEndArray?: OffsetCallback;
  onString?: DataCallback;
  onNumber?: DataCallback;
  onBigint?: DataCallback;
  onTrue?: OffsetCallback;
  onFalse?: OffsetCallback;
  onNull?: OffsetCallback;
}

export function parseSaxJson(str: string) {

  const charCount = str.length;

  let i = 0;

  while (i < charCount) {

  }

}
