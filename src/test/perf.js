const {parse, stringify, tokenizeJson} = require('../../lib/index-cjs');
const jsonBigint = require('json-bigint');

const objectInput = require('./test.json');
const jsonInput = JSON.stringify(objectInput);

const tokenizerOptions = {
  objectStart: () => undefined,
  objectEnd: () => undefined,
  arrayStart: () => undefined,
  arrayEnd: () => undefined,
  string: () => undefined,
  number: () => undefined,
  bigInt: () => undefined,
  true: () => undefined,
  false: () => undefined,
  null: () => undefined,
  colon: () => undefined,
  comma: () => undefined,
};

describe('Tokenize', () => {

  test('lib', (measure) => {
    measure(() => tokenizeJson(jsonInput, tokenizerOptions));
  });
}, {targetRme: 0.001});

describe('Parse', () => {

  test('JSON', (measure) => {
    measure(() => JSON.parse(jsonInput));
  });

  test('lib', (measure) => {
    measure(() => parse(jsonInput));
  });

  test('json-bigint', (measure) => {
    measure(() => jsonBigint.parse(jsonInput));
  });
}, {targetRme: 0.001});

describe('Stringify', () => {

  test('JSON', (measure) => {
    measure(() => JSON.stringify(objectInput));
  });

  test('lib', (measure) => {
    measure(() => stringify(objectInput));
  });

  test('json-bigint', (measure) => {
    measure(() => jsonBigint.stringify(objectInput));
  });
}, {targetRme: 0.001});
