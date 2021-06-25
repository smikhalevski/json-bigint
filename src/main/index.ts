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
