import {TokenHandler} from 'tokenizer-dsl';
import {decodeString} from './decodeString';
import {jsonTokenizer, Type} from './jsonTokenizer';
import {ParserContext} from './parser-types';
import {revive} from './revive';
import {Reviver} from './types';
import {die} from './utils';

function put(value: any, context: ParserContext): void {
  const {stack, cursor} = context;
  const parent = stack[cursor];

  if (context.arrayMode) {
    parent.push(value);
    return;
  }

  const {objectKey} = context;

  if (objectKey === null) {
    die('Object key expected');
  }
  if (objectKey === '__proto__' || objectKey === 'constructor') {
    Object.defineProperty(parent, objectKey, {
      configurable: true,
      enumerable: true,
      writable: true,
      value,
    });
  } else {
    parent[objectKey] = value;
  }

  context.objectKey = null;
}

const jsonTokenHandler: TokenHandler<Type, ParserContext> = {

  token(type, offset, length, context) {
    switch (type) {

      case Type.OBJECT_START: {
        const value = {};
        put(value, context);
        context.stack[++context.cursor] = value;
        context.arrayMode = false;
        break;
      }

      case Type.OBJECT_END:
        if (context.arrayMode) {
          die('Unexpected object end');
        }
        context.arrayMode = context.stack[--context.cursor] instanceof Array;
        break;

      case Type.ARRAY_START: {
        const value: any[] = [];
        put(value, context);
        context.stack[++context.cursor] = value;
        context.arrayMode = true;
        break;
      }

      case Type.ARRAY_END:
        if (!context.arrayMode) {
          die('Unexpected array end');
        }
        context.arrayMode = context.stack[--context.cursor] instanceof Array;
        break;

      case Type.STRING: {
        const value = decodeString(context.input.substr(offset + 1, length - 2));

        if (!context.arrayMode && context.objectKey === null) {
          context.objectKey = value;
          break;
        }
        put(value, context);
        break;
      }

      case Type.COLON:
        break;

      case Type.NUMBER:
        put(parseFloat(context.input.substr(offset, length)), context);
        break;
      case Type.BIGINT:
        put(context.parseBigInt(context.input.substr(offset, length)), context);
        break;
      case Type.TRUE:
        put(true, context);
        break;
      case Type.FALSE:
        put(false, context);
        break;
      case Type.NULL:
        put(null, context);
        break;
    }
  },

  unrecognizedToken(offset, context) {
    die('Unexpected char at ' + offset);
  },

  error(type, offset, errorCode, context) {
    die('Error ' + errorCode + ' occurred at ' + offset);
  },
};

export function parseJson(input: string, reviver?: Reviver, parseBigInt: (str: string) => unknown = BigInt): any {
  const parent = {'': null};

  jsonTokenizer(input, jsonTokenHandler, {
    stack: [parent],
    cursor: 0,
    arrayMode: false,
    objectKey: '',
    input,
    parseBigInt,
  });

  return reviver ? revive(parent, '', reviver) : parent[''];
}

