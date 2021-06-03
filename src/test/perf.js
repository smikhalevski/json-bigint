const fs = require('fs');
const path = require('path');
const bench = require('nodemark');
const {createJsonParser, tokenizeJson} = require('../../lib/index-cjs');
const JsonBigint = require('json-bigint');

const benchDuration = 10000;

const json = fs.readFileSync(path.join(__dirname, './test.json'), 'utf8');

function round(value) {
  return value.toFixed(1);
}

const parser = createJsonParser({bigintParser: (v) => v});

const libResult = bench(() => tokenizeJson(json, {}), null, benchDuration);
console.log('lib        ', libResult);

const nativeResult = bench(() => JSON.parse(json), null, benchDuration);
console.log('JSON       ', nativeResult);

const jsonBigintResult = bench(() => JsonBigint.parse(json), null, benchDuration);
console.log('JsonBigint ', libResult);

console.log(`
${round(nativeResult.mean / libResult.mean)}✕ faster than native JSON
${round(jsonBigintResult.mean / libResult.mean)}✕ faster than json-bigint
`);
