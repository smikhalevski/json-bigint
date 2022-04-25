export interface IJsonStringifierOptions {

  /**
   * Returns `true` if value is a `BigInt` instance.
   *
   * @param value The value to check.
   */
  isBigInt(value: any): boolean;

  /**
   * Converts a bigint instance to an string.
   *
   * @param value The bigint instance to convert.
   */
  stringifyBigInt(value: any): string;
}

export type Replacer = (this: any, key: string, value: any) => any;

export type JsonStringifier = (value: any, replacer?: Replacer | Array<unknown> | null, space?: string | number | null) => string;
