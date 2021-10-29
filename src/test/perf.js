const {test} = require('@smikhalevski/perf-test');
const {parse, stringify, tokenizeJson} = require('../../lib/index-cjs');
const JsonBigInt = require('json-bigint');
const chalk = require('chalk');

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

console.log(chalk.inverse(' Tokenize ') + '\n');

gc();
test('lib ', () => tokenizeJson(jsonInput, tokenizerOptions), {timeout: 20_000, targetRme: .002});

console.log('\n' + chalk.inverse(' Parse ') + '\n');

gc();
test('JSON        ', () => JSON.parse(jsonInput), {timeout: 20_000, targetRme: .002});
gc();
test('lib         ', () => parse(jsonInput), {timeout: 20_000, targetRme: .002});
gc();
test('json-bigint ', () => JsonBigInt.parse(jsonInput), {timeout: 20_000, targetRme: .002});

console.log('\n' + chalk.inverse(' Stringify ') + '\n');

gc();
test('JSON        ', () => JSON.stringify(objectInput));
gc();
test('lib         ', () => stringify(objectInput));
gc();
test('json-bigint ', () => JsonBigInt.stringify(objectInput));
