const fs = require('fs');
const path = require('path');
const bench = require('nodemark');
const {createJsonParser} = require('../../lib/index-cjs');
const JsonBigint = require('json-bigint');

const benchDuration = 10000;

const json = fs.readFileSync(path.join(__dirname, './test.json'), 'utf8');

function round(value) {
  return value.toFixed(1);
}

const parser = createJsonParser();

const libResult = bench(() => parser(json), null, benchDuration);
console.log('lib        ', libResult);

const nativeResult = bench(() => JSON.parse(json), null, benchDuration);
console.log('JSON       ', nativeResult);

const jsonBigintResult = bench(() => JsonBigint.parse(json), null, benchDuration);
console.log('JsonBigint ', jsonBigintResult);

console.log(`
${round(nativeResult.mean / libResult.mean)}✕ of native JSON
${round(jsonBigintResult.mean / libResult.mean)}✕ of json-bigint
`);
