import {createJsonParser} from './createJsonParser';

export {createJsonParser} from './createJsonParser';
export {tokenizeJson} from './tokenizeJson';

const Json: typeof JSON = {
  parse: createJsonParser(),
  stringify: () => '',
  [Symbol.toStringTag]: 'Json',
};

export default Json;
