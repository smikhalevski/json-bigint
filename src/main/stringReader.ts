import {ReaderFunction} from 'tokenizer-dsl';
import {die} from './utils';

/**
 * Reads the JSON-serialized string from the input.
 */
export const stringReader: ReaderFunction<unknown> = (input, offset) => {

  if (input.charCodeAt(offset) !== 34 /*"*/) {
    return -1;
  }

  let endIndex = input.indexOf('"', offset + 1);

  if (endIndex === -1) {
    die('Unterminated string', offset);
  }

  while (true) {
    let i = 1;

    // Check if the quot char is escaped
    while (i < endIndex - offset) {
      if (input.charCodeAt(endIndex - i) !== 92 /*\*/) {
        break;
      }
      ++i;
    }
    if (i % 2 === 0) {
      endIndex = input.indexOf('"', endIndex + 1);

      if (endIndex === -1) {
        die('Unterminated string', offset);
      }
      continue;
    }
    break;
  }

  return endIndex + 1;
};
