import {createJsonParser} from './createJsonParser';
import {createJsonStringifier} from './createJsonStringifier';

export * from './createJsonParser';
export * from './createJsonStringifier';
export * from './tokenizeJson';

const JsonBigint: Omit<typeof JSON, typeof Symbol.toStringTag> = {
  parse: createJsonParser(),
  stringify: createJsonStringifier(),
};

export default JsonBigint;
export {ITokenHandler} from './types';
export {ErrorCode} from './types';
export {Reviver} from './types';
export {IJsonParserOptions} from './types';
export {Replacer} from './types';
