export const enum ErrorCode {
  UNEXPECTED_TOKEN = -2,
  UNTERMINATED_STRING = -3,
  ILLEGAL_ESCAPE_CHAR = -4,
  INVALID_UTF_CHAR_CODE = -5,
}

export interface ITokenHandler {

  objectStart(start: number, end: number): void;

  objectEnd(start: number, end: number): void;

  arrayStart(start: number, end: number): void;

  arrayEnd(start: number, end: number): void;

  string(data: string, start: number, end: number): void;

  number(data: string, start: number, end: number): void;

  bigInt(data: string, start: number, end: number): void;

  true(start: number, end: number): void;

  false(start: number, end: number): void;

  null(start: number, end: number): void;

  colon(start: number, end: number): void;

  comma(start: number, end: number): void;
}

export interface IJsonParserOptions {

  /**
   * Converts integer string to a bigint instance.
   *
   * @param str The string with a valid integer number.
   * @default BigInt
   */
  bigIntParser?(str: string): any;
}

export type Reviver = (this: any, key: string, value: any) => any;

export type Replacer = (this: any, key: string, value: any) => any;

export type JsonParser = (str: string, reviver?: Reviver) => any;

export type JsonStringifier = (value: any, replacer?: Replacer | Array<unknown> | null, space?: string | number | null) => string;
