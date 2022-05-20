import {all, char, createTokenizer, maybe, or, Rule, seq, text} from 'tokenizer-dsl';
import {ParserContext} from './parser-types';
import {stringReader} from './stringReader';

const zeroOrManyDigitsReader = all(char([['0', '9']]));

const oneOrManyDigitsReader = all(char([['0', '9']]), {minimumCount: 1});

// 0 or -123 or 123
const integerReader = seq(
    maybe(text('-')),
    or(
        text('0'),
        seq(
            char([['1', '9']]),
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

export const enum TokenType {
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
  // COLON,
  COMMA,
}

const enum LexerStage {
  VALUE_START,
  VALUE_END,
  STRING_VALUE_END,
  OBJECT_KEY,
}

const objectStartRule: Rule<TokenType, LexerStage, ParserContext> = {
  on: [LexerStage.VALUE_START],
  type: TokenType.OBJECT_START,
  reader: objectStartReader,
  to: LexerStage.OBJECT_KEY,
};

const objectEndRule: Rule<TokenType, LexerStage, ParserContext> = {
  on: [LexerStage.OBJECT_KEY, LexerStage.STRING_VALUE_END, LexerStage.VALUE_END],
  type: TokenType.OBJECT_END,
  reader: objectEndReader,
  to: LexerStage.VALUE_END,
};

const arrayStartRule: Rule<TokenType, LexerStage, ParserContext> = {
  on: [LexerStage.VALUE_START],
  type: TokenType.ARRAY_START,
  reader: arrayStartReader,
};

const arrayEndRule: Rule<TokenType, LexerStage, ParserContext> = {
  on: [LexerStage.VALUE_START, LexerStage.STRING_VALUE_END, LexerStage.VALUE_END],
  type: TokenType.ARRAY_END,
  reader: arrayEndReader,
  to: LexerStage.VALUE_END,
};

const stringRule: Rule<TokenType, LexerStage, ParserContext> = {
  on: [LexerStage.VALUE_START, LexerStage.OBJECT_KEY],
  type: TokenType.STRING,
  reader: stringReader,
  to: LexerStage.STRING_VALUE_END,
};

const numberRule: Rule<TokenType, LexerStage, ParserContext> = {
  on: [LexerStage.VALUE_START],
  type: TokenType.NUMBER,
  reader: numberReader,
  to: LexerStage.VALUE_END,
};

const bigintRule: Rule<TokenType, LexerStage, ParserContext> = {
  on: [LexerStage.VALUE_START],
  type: TokenType.BIGINT,
  reader: bigintReader,
  to: LexerStage.VALUE_END,
};

const trueRule: Rule<TokenType, LexerStage, ParserContext> = {
  on: [LexerStage.VALUE_START],
  type: TokenType.TRUE,
  reader: trueReader,
  to: LexerStage.VALUE_END,
};

const falseRule: Rule<TokenType, LexerStage, ParserContext> = {
  on: [LexerStage.VALUE_START],
  type: TokenType.FALSE,
  reader: falseReader,
  to: LexerStage.VALUE_END,
};

const nullRule: Rule<TokenType, LexerStage, ParserContext> = {
  on: [LexerStage.VALUE_START],
  type: TokenType.NULL,
  reader: nullReader,
  to: LexerStage.VALUE_END,
};

const colonRule: Rule<TokenType, LexerStage, ParserContext> = {
  on: [LexerStage.STRING_VALUE_END],
  // type: TokenType.COLON,
  reader: colonReader,
  to: LexerStage.VALUE_START,
  silent: true,
};

const commaRule: Rule<TokenType, LexerStage, ParserContext> = {
  on: [LexerStage.STRING_VALUE_END, LexerStage.VALUE_END],
  type: TokenType.COMMA,
  reader: commaReader,
  to: LexerStage.VALUE_START,
};

const whitespaceRule: Rule<TokenType, LexerStage, ParserContext> = {
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
], LexerStage.VALUE_START);
