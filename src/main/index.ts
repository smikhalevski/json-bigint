import {createJsonParser} from './createJsonParser';
import {createJsonStringifier} from './createJsonStringifier';

export * from './createJsonParser';
export * from './createJsonStringifier';
export * from './tokenizeJson';

const JsonBigint: typeof JSON = {
  parse: createJsonParser(),
  stringify: createJsonStringifier(),
  [Symbol.toStringTag]: 'JsonBigint',
};

export default JsonBigint;
