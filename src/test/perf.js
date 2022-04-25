const {parse, stringify} = require('../../lib/index-cjs');
const jsonBigint = require('json-bigint');

const largeJsonInput = JSON.stringify(require('../../package-lock.json'), null, 2);
const smallJsonInput = JSON.stringify(require('../../package.json'), null, 2);
const objectInput = require('./test.json');
const jsonInput = JSON.stringify(objectInput);
//
// describe('Parse large input', () => {
//
//   test('JSON', (measure) => {
//     measure(() => JSON.parse(largeJsonInput));
//   });
//
//   test('lib', (measure) => {
//     measure(() => parse(largeJsonInput));
//   });
//
//   test('json-bigint', (measure) => {
//     measure(() => jsonBigint.parse(largeJsonInput));
//   });
// }, {targetRme: 0.001});
//
// describe('Parse small input', () => {
//
//   test('JSON', (measure) => {
//     measure(() => JSON.parse(smallJsonInput));
//   });
//
//   test('lib', (measure) => {
//     measure(() => parse(smallJsonInput));
//   });
//
//   test('json-bigint', (measure) => {
//     measure(() => jsonBigint.parse(smallJsonInput));
//   });
// }, {targetRme: 0.001});
//
// describe('Parse', () => {
//
//   test('JSON', (measure) => {
//     measure(() => JSON.parse(jsonInput));
//   });
//
//   test('lib', (measure) => {
//     measure(() => parse(jsonInput));
//   });
//
//   test('json-bigint', (measure) => {
//     measure(() => jsonBigint.parse(jsonInput));
//   });
// }, {targetRme: 0.001});
//
// describe('Parse string', () => {
//
//   test('JSON', (measure) => {
//     measure(() => JSON.parse('"aaaaaa"'));
//   });
//
//   test('lib', (measure) => {
//     measure(() => parse('"aaaaaa"'));
//   });
//
//   test('json-bigint', (measure) => {
//     measure(() => jsonBigint.parse('"aaaaaa"'));
//   });
// }, {targetRme: 0.001});

describe('Parse small object', () => {

  test('JSON', (measure) => {
    measure(() => JSON.parse('{"foo":"bar"}'));
  });

  test('lib', (measure) => {
    measure(() => parse('{"foo":"bar"}'));
  });

  test('json-bigint', (measure) => {
    measure(() => jsonBigint.parse('{"foo":"bar"}'));
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
