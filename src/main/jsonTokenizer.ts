import {all, char, createTokenizer, maybe, NO_MATCH, or, ReaderFunction, Rule, seq, text} from 'tokenizer-dsl';
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

const zeroOrManyDigitsReader = all(char([['0'.charCodeAt(0), '9'.charCodeAt(0)]]));

const oneOrManyDigitsReader = all(char([['0'.charCodeAt(0), '9'.charCodeAt(0)]]), {minimumCount: 1});

// 0 or -123 or 123
const integerReader = seq(
    maybe(text('-')),
    or(
        text('0'),
        seq(
            char([['1'.charCodeAt(0), '9'.charCodeAt(0)]]),
            zeroOrManyDigitsReader,
        ),
    ),
);

// .123
const fractionReader = seq(text('.'), oneOrManyDigitsReader);

// e5 or E5
const exponentReader = seq(
    char(['eE']),
    maybe(char(['+-'])),
    oneOrManyDigitsReader,
);

const numberReader = seq(
    integerReader,
    or(
        seq(
            fractionReader,
            maybe(exponentReader),
        ),
        exponentReader,
    ),
);

const bigintReader = integerReader;

const trueReader = text('true');

const falseReader = text('false');

const nullReader = text('null');

const colonReader = text(':');

const commaReader = text(',');

const whitespaceReader = all(char([' \t\r\n']));

const objectStartReader = text('{');

const objectEndReader = text('}');

const arrayStartReader = text('[');

const arrayEndReader = text(']');

export const enum Type {
  OBJECT_START,
  OBJECT_END,
  ARRAY_START,
  ARRAY_END,
  STRING,
  NUMBER,
  BIGINT,
  TRUE,
  FALSE,
  NULL,
  COLON,
}

export const enum Stage {
  VALUE_START,
  VALUE_END,
  STRING_VALUE_END,
  OBJECT_KEY,
}

const objectStartRule: Rule<Type, Stage, ParserContext> = {
  on: [Stage.VALUE_START],
  type: Type.OBJECT_START,
  reader: objectStartReader,
  to: Stage.OBJECT_KEY,
};

const objectEndRule: Rule<Type, Stage, ParserContext> = {
  on: [Stage.OBJECT_KEY, Stage.STRING_VALUE_END, Stage.VALUE_END],
  type: Type.OBJECT_END,
  reader: objectEndReader,
  to: Stage.VALUE_END,
};

const arrayStartRule: Rule<Type, Stage, ParserContext> = {
  on: [Stage.VALUE_START],
  type: Type.ARRAY_START,
  reader: arrayStartReader,
};

const arrayEndRule: Rule<Type, Stage, ParserContext> = {
  on: [Stage.VALUE_START, Stage.STRING_VALUE_END, Stage.VALUE_END],
  type: Type.ARRAY_END,
  reader: arrayEndReader,
  to: Stage.VALUE_END,
};

const stringRule: Rule<Type, Stage, ParserContext> = {
  on: [Stage.VALUE_START, Stage.OBJECT_KEY],
  type: Type.STRING,
  reader: stringReader,
  to: Stage.STRING_VALUE_END,
};

const numberRule: Rule<Type, Stage, ParserContext> = {
  on: [Stage.VALUE_START],
  type: Type.NUMBER,
  reader: numberReader,
  to: Stage.VALUE_END,
};

const bigintRule: Rule<Type, Stage, ParserContext> = {
  on: [Stage.VALUE_START],
  type: Type.BIGINT,
  reader: bigintReader,
  to: Stage.VALUE_END,
};

const trueRule: Rule<Type, Stage, ParserContext> = {
  on: [Stage.VALUE_START],
  type: Type.TRUE,
  reader: trueReader,
  to: Stage.VALUE_END,
};

const falseRule: Rule<Type, Stage, ParserContext> = {
  on: [Stage.VALUE_START],
  type: Type.FALSE,
  reader: falseReader,
  to: Stage.VALUE_END,
};

const nullRule: Rule<Type, Stage, ParserContext> = {
  on: [Stage.VALUE_START],
  type: Type.NULL,
  reader: nullReader,
  to: Stage.VALUE_END,
};

const colonRule: Rule<Type, Stage, ParserContext> = {
  on: [Stage.STRING_VALUE_END],
  type: Type.COLON,
  reader: colonReader,
  to: Stage.VALUE_START,
};

const commaRule: Rule<Type, Stage, ParserContext> = {
  silent: true,
  on: [Stage.STRING_VALUE_END, Stage.VALUE_END],
  reader: commaReader,
  to: Stage.VALUE_START,
};

const whitespaceRule: Rule<Type, Stage, ParserContext> = {
  silent: true,
  reader: whitespaceReader,
};

export const jsonTokenizer = createTokenizer([
  whitespaceRule,
  commaRule,
  stringRule,
  trueRule,
  falseRule,
  nullRule,
  colonRule,
  numberRule,
  bigintRule,
  objectStartRule,
  objectEndRule,
  arrayStartRule,
  arrayEndRule,
], Stage.VALUE_START);
