const {test} = require('@smikhalevski/perf-test');
const {createJsonParser, createJsonStringifier, tokenizeJson} = require('../../lib/index-cjs');
const JsonBigint = require('json-bigint');
const chalk = require('chalk');

const objectInput = require('./test.json');
const jsonInput = JSON.stringify(objectInput);

const jsonParser = createJsonParser();
const jsonStringifier = createJsonStringifier();

const tokOpt = {
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

console.log(chalk.inverse(' Parse ') + '\n');

test('JSON        ', () => JSON.parse(jsonInput), {timeout: 20_000, targetRme: .002});
gc();
// test('lib         ', () => tokenizeJson(jsonInput, tokOpt), {timeout: 20_000, targetRme: .002});
test('lib         ', () => jsonParser(jsonInput), {timeout: 20_000, targetRme: .002});
gc();
test('json-bigint ', () => JsonBigint.parse(jsonInput), {timeout: 20_000, targetRme: .002});

// console.log('\n' + chalk.inverse(' Stringify ') + '\n');
//
// test('JSON        ', () => JSON.stringify(objectInput));
// test('lib         ', () => jsonStringifier(objectInput));
// test('json-bigint ', () => JsonBigint.stringify(objectInput));
