import {IJsonTokenizerOptions, tokenizeJson} from './tokenizeJson';
import {ResultCode} from '../../../tokenizer-dsl';

const enum Mode {
  OBJECT_START,
  OBJECT_PAIR,
  OBJECT_KEY,
  OBJECT_COMMA,
  OBJECT_COLON,
  ARRAY_START,
  ARRAY_ITEM,
  ARRAY_COMMA,
  LITERAL,
}

type Reviver = (this: any, key: string, value: any) => any;

interface IJsonParserOptions {
  bigintParser?: (str: string) => any;
}

export function createJsonParser(options: IJsonParserOptions = {}): (str: string, reviver?: Reviver) => any {
  const {
    bigintParser = BigInt,
  } = options;

  const queue = new Array(50);
  const modes = new Array<Mode>(50);

  let key: string;
  let depth = -1;

  const insertValue = (value: unknown, start: number): void => {
    if (modes[depth] === Mode.OBJECT_COLON) {
      queue[depth][key] = value;
      modes[depth] = Mode.OBJECT_PAIR;
      return;
    }
    if (modes[depth] === Mode.ARRAY_START || modes[depth] === Mode.ARRAY_COMMA) {
      queue[depth].push(value);
      modes[depth] = Mode.ARRAY_ITEM;
      return;
    }
    throw new SyntaxError(`Unexpected token at ${start}`);
  };

  const insertLiteral = (value: unknown, start: number): void => {
    if (depth === -1) {
      queue[0] = value;
      modes[0] = Mode.LITERAL;
      return;
    }
    insertValue(value, start);
  };

  const tokenizerOptions: IJsonTokenizerOptions = {

    onObjectStart(start) {
      const value = queue[depth + 1] = {};
      modes[depth + 1] = Mode.OBJECT_START;

      if (depth !== -1) {
        insertValue(value, start);
      }
      depth++;
    },

    onObjectEnd(start) {
      if (modes[depth] === Mode.OBJECT_PAIR || modes[depth] === Mode.OBJECT_START) {
        depth--;
        return;
      }
      throw new SyntaxError(`Unexpected token at ${start}`);
    },

    onArrayStart(start) {
      const value = queue[depth + 1] = [];
      modes[depth + 1] = Mode.ARRAY_START;

      if (depth !== -1) {
        insertValue(value, start);
      }
      depth++;
    },

    onArrayEnd(start) {
      if (modes[depth] === Mode.ARRAY_ITEM || modes[depth] === Mode.ARRAY_START) {
        depth--;
        return;
      }
      throw new SyntaxError(`Unexpected token at ${start}`);
    },

    onString(data, start) {
      if (modes[depth] === Mode.OBJECT_START || modes[depth] === Mode.OBJECT_COMMA) {
        key = data;
        modes[depth] = Mode.OBJECT_KEY;
        return;
      }
      insertLiteral(data, start);
    },

    onNumber(data, start) {
      insertLiteral(parseFloat(data), start);
    },

    onBigInt(data, start) {
      insertLiteral(bigintParser(data), start);
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
      if (modes[depth] === Mode.OBJECT_KEY) {
        modes[depth] = Mode.OBJECT_COLON;
        return;
      }
      throw new SyntaxError(`Unexpected token at ${start}`);
    },

    onComma(start) {
      if (modes[depth] === Mode.OBJECT_PAIR) {
        modes[depth] = Mode.OBJECT_COMMA;
        return;
      }
      if (modes[depth] === Mode.ARRAY_ITEM) {
        modes[depth] = Mode.ARRAY_COMMA;
        return;
      }
      throw new SyntaxError(`Unexpected token at ${start}`);
    },
  };

  return (str, reviver) => {
    depth = -1;

    const result = tokenizeJson(str, tokenizerOptions);

    if (result === ResultCode.ERROR) {
      throw new SyntaxError(`Unexpected token`);
    }
    if (str.length !== result) {
      throw new SyntaxError(`Unexpected token at ${result}`);
    }
    if (depth !== -1) {
      throw new SyntaxError('Unexpected end');
    }

    return reviver ? revive({'': queue[0]}, '', reviver) : queue[0];
  };
}

export function revive(parent: any, key: string, reviver: Reviver): any {
  const obj = parent[key];

  if (obj !== null && typeof obj === 'object') {
    const keys = Object.keys(obj);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = revive(obj, key, reviver);

      if (value !== undefined) {
        obj[key] = value;
      } else {
        delete obj[key];
      }
    }
  }

  return reviver.call(parent, key, obj);
}
