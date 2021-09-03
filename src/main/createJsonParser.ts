import {ERROR_CODE, IJsonTokenizerOptions, tokenizeJson} from './tokenizeJson';
import {revive} from './revive';

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

export interface IJsonParserOptions {

  /**
   * Converts integer string to a bigint instance.
   *
   * @default BigInt
   */
  bigIntParser?: (str: string) => any;
}

export type Reviver = (this: any, key: string, value: any) => any;

interface IJsonParserContext {
  queue: Array<any>;
  modes: Array<Mode>;
  key: string;
  unsafeKey: boolean;
  index: number;
  mode: Mode;
}

export function createJsonParser(options: IJsonParserOptions = {}): (str: string, reviver?: Reviver) => any {
  const {bigIntParser = BigInt} = options;

  const insertChild = (context: IJsonParserContext, value: unknown, start: number): void => {
    const {queue, modes, key, unsafeKey, index, mode} = context;

    if (mode === Mode.OBJECT_COLON) {
      if (unsafeKey) {
        Object.defineProperty(queue[index], key, {
          configurable: true,
          enumerable: true,
          writable: true,
          value,
        });
      } else {
        context.queue[index][key] = value;
      }
      modes[index] = context.mode = Mode.OBJECT_PAIR;
      return;
    }
    if (mode === Mode.ARRAY_START || mode === Mode.ARRAY_COMMA) {
      queue[index].push(value);
      modes[index] = context.mode = Mode.ARRAY_ITEM;
      return;
    }
    throwSyntaxError(`Unexpected token at ${start}`);
  };

  const insertLiteral = (context: IJsonParserContext, value: unknown, start: number): void => {
    const {queue, modes, mode} = context;

    if (mode === Mode.STREAM_START) {
      queue[0] = value;
      modes[0] = context.mode = Mode.STREAM_END;
      return;
    }
    insertChild(context, value, start);
  };

  const tokenizerOptions: IJsonTokenizerOptions<IJsonParserContext> = {

    objectStart(context, start) {
      const value = {};

      if (context.mode !== Mode.STREAM_START) {
        insertChild(context, value, start);
      }
      const index = ++context.index;
      context.queue[index] = value;
      context.modes[index] = context.mode = Mode.OBJECT_START;
    },

    objectEnd(context, start) {
      const {mode} = context;
      if (mode === Mode.OBJECT_PAIR || mode === Mode.OBJECT_START) {
        context.mode = context.index-- === 0 ? Mode.STREAM_END : context.modes[context.index];
        return;
      }
      throwSyntaxError(`Unexpected token at ${start}`);
    },

    arrayStart(context, start) {
      const value: Array<any> = [];

      if (context.mode !== Mode.STREAM_START) {
        insertChild(context, value, start);
      }
      const index = ++context.index;
      context.queue[index] = value;
      context.modes[index] = context.mode = Mode.ARRAY_START;
    },

    arrayEnd(context, start) {
      const {mode} = context;
      if (mode === Mode.ARRAY_ITEM || mode === Mode.ARRAY_START) {
        context.mode = context.index-- === 0 ? Mode.STREAM_END : context.modes[context.index];
        return;
      }
      throwSyntaxError(`Unexpected token at ${start}`);
    },

    string(context, data, start) {
      const {mode} = context;

      if (mode === Mode.OBJECT_START || mode === Mode.OBJECT_COMMA) {
        const key = context.key = data;
        context.unsafeKey = key === '__proto__' || key === 'constructor';
        context.modes[context.index] = context.mode = Mode.OBJECT_KEY;
        return;
      }
      insertLiteral(context, data, start);
    },

    number(context, data, start) {
      insertLiteral(context, parseFloat(data), start);
    },

    bigInt(context, data, start) {
      insertLiteral(context, bigIntParser(data), start);
    },

    true(context, start) {
      insertLiteral(context, true, start);
    },

    false(context, start) {
      insertLiteral(context, false, start);
    },

    null(context, start) {
      insertLiteral(context, null, start);
    },

    colon(context, start) {
      const {mode} = context;

      if (mode === Mode.OBJECT_KEY) {
        context.modes[context.index] = context.mode = Mode.OBJECT_COLON;
        return;
      }
      throwSyntaxError(`Unexpected token at ${start}`);
    },

    comma(context, start) {
      const {mode} = context;
      if (mode === Mode.OBJECT_PAIR) {
        context.modes[context.index] = context.mode = Mode.OBJECT_COMMA;
        return;
      }
      if (mode === Mode.ARRAY_ITEM) {
        context.modes[context.index] = context.mode = Mode.ARRAY_COMMA;
        return;
      }
      throwSyntaxError(`Unexpected token at ${start}`);
    },
  };

  return (str, reviver) => {

    const context: IJsonParserContext = {
      queue: [],
      modes: [],
      key: '',
      unsafeKey: false,
      index: -1,
      mode: Mode.STREAM_START,
    };

    const result = tokenizeJson(context, str, tokenizerOptions);

    if (result === ERROR_CODE) {
      throwSyntaxError(`Unexpected token at 0`);
    }
    if (str.length !== result) {
      throwSyntaxError(`Unexpected token at ${result}`);
    }
    if (context.mode !== Mode.STREAM_END) {
      throwSyntaxError('Unexpected end');
    }

    return reviver ? revive({'': context.queue[0]}, '', reviver) : context.queue[0];
  };
}

function throwSyntaxError(message: string): never {
  throw new SyntaxError(message);
}
