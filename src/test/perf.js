const {test} = require('@smikhalevski/perf-test');
const {createJsonParser, createJsonStringifier} = require('../../lib/index-cjs');
const JsonBigint = require('json-bigint');
const chalk = require('chalk');

const objectInput = require('./test.json');
const jsonInput = JSON.stringify(objectInput);

const jsonParser = createJsonParser();
const jsonStringifier = createJsonStringifier();

console.log(chalk.inverse(' Parse ') + '\n');

test('JSON        ', () => JSON.parse(jsonInput));
test('lib         ', () => jsonParser(jsonInput));
test('json-bigint ', () => JsonBigint.parse(jsonInput));

console.log('\n' + chalk.inverse(' Stringify ') + '\n');

test('JSON        ', () => JSON.stringify(objectInput));
test('lib         ', () => jsonStringifier(objectInput));
test('json-bigint ', () => JsonBigint.stringify(objectInput));
