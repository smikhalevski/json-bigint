import {NO_MATCH, ReaderFunction} from 'tokenizer-dsl';
import {ParserContext} from './parser-types';
import {die} from './utils';

export const stringReader: ReaderFunction<ParserContext> = (input, offset, context) => {

  if (input.charCodeAt(offset) !== 34 /* " */) {
    return NO_MATCH;
  }
  offset++;

  let endOffset = input.indexOf('"', offset);

  if (endOffset === -1) {
    die('Unterminated string');
  }

  while (true) {
    let i = 1;

    while (i < endOffset - offset) {
      if (input.charCodeAt(endOffset - i) !== 92 /* \ */) {
        break;
      }
      ++i;
    }
    if (i % 2 === 0) {
      endOffset = input.indexOf('"', endOffset + 1);

      if (endOffset === -1) {
        die('Unterminated string');
      }
      continue;
    }
    break;
  }

  return endOffset + 1;
};
