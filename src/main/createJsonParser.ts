import {tokenizeJson} from './tokenizeJson';
import {revive} from './revive';
import {ResultCode} from 'tokenizer-dsl';
import {IJsonParserOptions, ITokenHandler, JsonParser} from './types';

const enum Mode {
  STREAM_START,
  STREAM_END,
  OBJECT_START,
  OBJECT_PAIR,
  OBJECT_KEY,
  OBJECT_COMMA,
  OBJECT_COLON,
  ARRAY_START,
  ARRAY_ITEM,
  ARRAY_COMMA,
}

export function createJsonParser(options: IJsonParserOptions): JsonParser {
  const {parseBigInt} = options;

  const queue: Array<any> = [];
  const modes: Array<Mode> = [];

  let key: string;
  let index: number;
  let mode: Mode;

  const insertChild = (value: unknown, start: number): void => {

    if (mode === Mode.OBJECT_COLON) {
      if (key === '__proto__' || key === 'constructor') {
        Object.defineProperty(queue[index], key, {
          configurable: true,
          enumerable: true,
          writable: true,
          value,
        });
      } else {
        queue[index][key] = value;
      }
      modes[index] = mode = Mode.OBJECT_PAIR;
      return;
    }

    if (mode === Mode.ARRAY_START || mode === Mode.ARRAY_COMMA) {
      queue[index].push(value);
      modes[index] = mode = Mode.ARRAY_ITEM;
      return;
    }
    throwSyntaxError(`Unexpected token at ${start}`);
  };

  const insertLiteral = (value: unknown, start: number): void => {

    if (mode === Mode.STREAM_START) {
      queue[0] = value;
      modes[0] = mode = Mode.STREAM_END;
      return;
    }
    insertChild(value, start);
  };

  const handler: ITokenHandler = {

    objectStart(start) {
      const value = {};

      if (mode !== Mode.STREAM_START) {
        insertChild(value, start);
      }
      ++index;
      queue[index] = value;
      modes[index] = mode = Mode.OBJECT_START;
    },

    objectEnd(start) {
      if (mode === Mode.OBJECT_PAIR || mode === Mode.OBJECT_START) {
        mode = --index === -1 ? Mode.STREAM_END : modes[index];
        return;
      }
      throwSyntaxError(`Unexpected token at ${start}`);
    },

    arrayStart(start) {
      const value: Array<any> = [];

      if (mode !== Mode.STREAM_START) {
        insertChild(value, start);
      }
      ++index;
      queue[index] = value;
      modes[index] = mode = Mode.ARRAY_START;
    },

    arrayEnd(start) {
      if (mode === Mode.ARRAY_ITEM || mode === Mode.ARRAY_START) {
        mode = --index === -1 ? Mode.STREAM_END : modes[index];
        return;
      }
      throwSyntaxError(`Unexpected token at ${start}`);
    },

    string(data, start) {
      if (mode === Mode.OBJECT_START || mode === Mode.OBJECT_COMMA) {
        key = data;
        modes[index] = mode = Mode.OBJECT_KEY;
        return;
      }
      insertLiteral(data, start);
    },

    number(data, start) {
      insertLiteral(parseFloat(data), start);
    },

    bigInt(data, start) {
      insertLiteral(parseBigInt(data), start);
    },

    true(start) {
      insertLiteral(true, start);
    },

    false(start) {
      insertLiteral(false, start);
    },

    null(start) {
      insertLiteral(null, start);
    },

    colon(start) {
      if (mode === Mode.OBJECT_KEY) {
        modes[index] = mode = Mode.OBJECT_COLON;
        return;
      }
      throwSyntaxError(`Unexpected token at ${start}`);
    },

    comma(start) {
      if (mode === Mode.OBJECT_PAIR) {
        modes[index] = mode = Mode.OBJECT_COMMA;
        return;
      }
      if (mode === Mode.ARRAY_ITEM) {
        modes[index] = mode = Mode.ARRAY_COMMA;
        return;
      }
      throwSyntaxError(`Unexpected token at ${start}`);
    },
  };

  return (str, reviver) => {

    index = -1;
    mode = Mode.STREAM_START as Mode;

    const result = tokenizeJson(str, handler);

    if (result < ResultCode.NO_MATCH) {
      throwSyntaxError('Unexpected token at 0');
    }
    if (str.length !== result) {
      throwSyntaxError(`Unexpected token at ${result}`);
    }
    if (mode !== Mode.STREAM_END) {
      throwSyntaxError('Unexpected end');
    }

    const root = reviver ? revive({'': queue[0]}, '', reviver) : queue[0];

    queue.fill(null);
    modes.fill(-1);

    return root;
  };
}

function throwSyntaxError(message: string): never {
  throw new SyntaxError(message);
}
