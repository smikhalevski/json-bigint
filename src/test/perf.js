const bench = require('nodemark');
const {createJsonParser, createJsonStringifier} = require('../../lib/index-cjs');
const JsonBigint = require('json-bigint');

const benchDuration = 10000;

const obj = require('./test.json');
const json = JSON.stringify(obj);

function round(value) {
  return value.toFixed(1);
}

const parser = createJsonParser();

const parseNativeResult = bench(() => JSON.parse(json), null, benchDuration);
console.log('JSON        ', parseNativeResult);

const parseLibResult = bench(() => parser(json), null, benchDuration);
console.log('lib         ', parseLibResult);

const parseJsonBigintResult = bench(() => JsonBigint.parse(json), null, benchDuration);
console.log('json-bigint ', parseJsonBigintResult);

console.log(`
Parse
  ${round(parseNativeResult.mean / parseLibResult.mean)}✕ of native JSON
  ${round(parseJsonBigintResult.mean / parseLibResult.mean)}✕ of json-bigint
`);

const stringify = createJsonStringifier();

const stringifyNativeResult = bench(() => JSON.stringify(obj), null, benchDuration);
console.log('JSON        ', stringifyNativeResult);

const stringifyLibResult = bench(() => stringify(obj), null, benchDuration);
console.log('lib         ', stringifyLibResult);

const stringifyJsonBigintResult = bench(() => JsonBigint.stringify(obj), null, benchDuration);
console.log('json-bigint ', stringifyJsonBigintResult);

console.log(`
Stringify
  ${round(stringifyNativeResult.mean / stringifyLibResult.mean)}✕ of native JSON
  ${round(stringifyJsonBigintResult.mean / stringifyLibResult.mean)}✕ of json-bigint
`);
