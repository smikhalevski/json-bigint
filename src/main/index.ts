import {parseJson} from './parseJson';
import {createJsonStringifier} from './createJsonStringifier';

export * from './createJsonStringifier';
export * from './types';

export const parse = parseJson;

export const stringify = createJsonStringifier({
  isBigInt: (value) => typeof value === 'bigint',
  stringifyBigInt: String,
});
