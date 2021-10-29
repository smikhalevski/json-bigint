import {createJsonParser} from './createJsonParser';
import {createJsonStringifier} from './createJsonStringifier';

export * from './createJsonParser';
export * from './createJsonStringifier';
export * from './tokenizeJson';
export * from './types';

export const parse = createJsonParser({
  parseBigInt: typeof BigInt === 'function' ? BigInt : Number,
});

export const stringify = createJsonStringifier({
  isBigInt: (value) => typeof value === 'bigint',
  stringifyBigInt: String,
});
