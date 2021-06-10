import {createJsonParser} from './createJsonParser';

export * from './createJsonParser';
export * from './tokenizeJson';

const exports: typeof JSON = {
  parse: createJsonParser(),
  stringify: () => '',
  [Symbol.toStringTag]: 'JSON',
};

export default exports;
