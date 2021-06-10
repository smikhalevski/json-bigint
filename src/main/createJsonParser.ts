import {IJsonTokenizerOptions, tokenizeJson} from './tokenizeJson';
import {ResultCode} from 'tokenizer-dsl';
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

interface IJsonParserOptions {

  /**
   * Converts integer string to a bigint instance.
   *
   * @default BigInt
   */
  bigIntParser?: (str: string) => any;
}

export type Reviver = (this: any, key: string, value: any) => any;

export function createJsonParser(options: IJsonParserOptions = {}): (str: string, reviver?: Reviver) => any {
  const {
    bigIntParser = BigInt,
  } = options;

  const queue = new Array(100);
  const modes = new Array<Mode>(100).fill(-1);

  let key: string;
  let index: number;
  let mode: Mode;

  const insertChild = (value: unknown, start: number): void => {
    if (mode === Mode.OBJECT_COLON) {
      queue[index][key] = value;
      modes[index] = mode = Mode.OBJECT_PAIR;
      return;
    }
    if (mode === Mode.ARRAY_START || mode === Mode.ARRAY_COMMA) {
      queue[index].push(value);
      modes[index] = mode = Mode.ARRAY_ITEM;
      return;
    }
    throw new SyntaxError(`Unexpected token at ${start}`);
  };

  const insertLiteral = (value: unknown, start: number): void => {
    if (mode === Mode.STREAM_START) {
      queue[0] = value;
      modes[0] = mode = Mode.STREAM_END;
      return;
    }
    insertChild(value, start);
  };

  const tokenizerOptions: IJsonTokenizerOptions = {

    onObjectStart(start) {
      const value = {};

      if (mode !== Mode.STREAM_START) {
        insertChild(value, start);
      }
      index++;
      queue[index] = value;
      modes[index] = mode = Mode.OBJECT_START;
    },

    onObjectEnd(start) {
      if (mode === Mode.OBJECT_PAIR || mode === Mode.OBJECT_START) {
        mode = index-- === 0 ? Mode.STREAM_END : modes[index];
        return;
      }
      throw new SyntaxError(`Unexpected token at ${start}`);
    },

    onArrayStart(start) {
      const value: Array<any> = [];

      if (mode !== Mode.STREAM_START) {
        insertChild(value, start);
      }
      index++;
      queue[index] = value;
      modes[index] = mode = Mode.ARRAY_START;
    },

    onArrayEnd(start) {
      if (mode === Mode.ARRAY_ITEM || mode === Mode.ARRAY_START) {
        mode = index-- === 0 ? Mode.STREAM_END : modes[index];
        return;
      }
      throw new SyntaxError(`Unexpected token at ${start}`);
    },

    onString(data, start) {
      if (mode === Mode.OBJECT_START || mode === Mode.OBJECT_COMMA) {
        key = data;
        modes[index] = mode = Mode.OBJECT_KEY;
        return;
      }
      insertLiteral(data, start);
    },

    onNumber(data, start) {
      insertLiteral(parseFloat(data), start);
    },

    onBigInt(data, start) {
      insertLiteral(bigIntParser(data), start);
    },

    onTrue(start) {
      insertLiteral(true, start);
    },

    onFalse(start) {
      insertLiteral(false, start);
    },

    onNull(start) {
      insertLiteral(null, start);
    },

    onColon(start) {
      if (mode === Mode.OBJECT_KEY) {
        modes[index] = mode = Mode.OBJECT_COLON;
        return;
      }
      throw new SyntaxError(`Unexpected token at ${start}`);
    },

    onComma(start) {
      if (mode === Mode.OBJECT_PAIR) {
        modes[index] = mode = Mode.OBJECT_COMMA;
        return;
      }
      if (mode === Mode.ARRAY_ITEM) {
        modes[index] = mode = Mode.ARRAY_COMMA;
        return;
      }
      throw new SyntaxError(`Unexpected token at ${start}`);
    },
  };

  return (str, reviver) => {
    index = -1;
    mode = Mode.STREAM_START as Mode;

    const result = tokenizeJson(str, tokenizerOptions);

    if (result === ResultCode.ERROR) {
      throw new SyntaxError(`Unexpected token`);
    }
    if (str.length !== result) {
      throw new SyntaxError(`Unexpected token at ${result}`);
    }
    if (mode !== Mode.STREAM_END) {
      throw new SyntaxError('Unexpected end');
    }

    return reviver ? revive({'': queue[0]}, '', reviver) : queue[0];
  };
}
