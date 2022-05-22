import {TokenHandler} from 'tokenizer-dsl';
import {decodeString} from './decodeString';
import {jsonTokenizer, TokenType} from './jsonTokenizer';
import {ParserContext} from './parser-types';
import {revive} from './revive';
import {die} from './utils';

export function parseJson(input: string, reviver?: (this: any, key: string, value: any) => any, parseBigInt: (str: string) => any = BigInt): any {
  const parent = {'': null};

  const state = jsonTokenizer(input, jsonTokenHandler, {
    stack: [parent],
    cursor: 0,
    arrayMode: false,
    objectKey: '',
    parseBigInt,
  });

  if (state.offset !== input.length) {
    die('Unexpected token', state.offset);
  }

  return reviver ? revive(parent, '', reviver) : parent[''];
}

function putValue(value: any, offset: number, context: ParserContext): void {
  const {stack, cursor} = context;
  const parent = stack[cursor];

  if (context.arrayMode) {
    parent.push(value);
    return;
  }

  const {objectKey} = context;

  if (objectKey === null) {
    die('Object key expected', offset);
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

const jsonTokenHandler: TokenHandler<TokenType, ParserContext> = (type, chunk, offset, length, context) => {
  let value: any;

  switch (type) {

    case TokenType.OBJECT_START:
      value = {};
      putValue(value, offset, context);
      context.stack[++context.cursor] = value;
      context.arrayMode = false;
      break;

    case TokenType.OBJECT_END:
      if (context.arrayMode) {
        die('Unexpected end of object', offset);
      }
      context.arrayMode = context.stack[--context.cursor] instanceof Array;
      break;

    case TokenType.ARRAY_START:
      value = [];
      putValue(value, offset, context);
      context.stack[++context.cursor] = value;
      context.arrayMode = true;
      break;

    case TokenType.ARRAY_END:
      if (!context.arrayMode) {
        die('Unexpected end of array', offset);
      }
      context.arrayMode = context.stack[--context.cursor] instanceof Array;
      break;

    case TokenType.STRING:
      value = decodeString(chunk.substr(offset + 1, length - 2), offset + 1);

      if (!context.arrayMode && context.objectKey === null) {
        context.objectKey = value;
        break;
      }
      putValue(value, offset, context);
      break;

    case TokenType.COMMA:
      if (context.cursor === 0) {
        die('Unexpected token', offset);
      }
      break;

    case TokenType.NUMBER:
      putValue(parseFloat(chunk.substr(offset, length)), offset, context);
      break;
    case TokenType.BIGINT:
      putValue(context.parseBigInt(chunk.substr(offset, length)), offset, context);
      break;
    case TokenType.TRUE:
      putValue(true, offset, context);
      break;
    case TokenType.FALSE:
      putValue(false, offset, context);
      break;
    case TokenType.NULL:
      putValue(null, offset, context);
      break;
  }
};
