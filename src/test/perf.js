const {parse, stringify} = require('../../lib/index-cjs');
const jsonBigint = require('json-bigint');

const packageLockJson = require('../../package-lock.json');
const packageJson = require('../../package.json');

const packageLockStr = JSON.stringify(packageLockJson);
const packageStr = JSON.stringify(packageJson);

describe('Parse', () => {

  describe('package-lock.json', () => {

    test('JSON', (measure) => {
      measure(() => JSON.parse(packageLockStr));
    });

    test('lib', (measure) => {
      measure(() => parse(packageLockStr));
    });

    test('json-bigint', (measure) => {
      measure(() => jsonBigint.parse(packageLockStr));
    });
  });


  describe('package.json', () => {

    test('JSON', (measure) => {
      measure(() => JSON.parse(packageStr));
    });

    test('lib', (measure) => {
      measure(() => parse(packageStr));
    });

    test('json-bigint', (measure) => {
      measure(() => jsonBigint.parse(packageStr));
    });
  });


  describe('"aaaaaa"', () => {

    test('JSON', (measure) => {
      measure(() => JSON.parse('"aaaaaa"'));
    });

    test('lib', (measure) => {
      measure(() => parse('"aaaaaa"'));
    });

    test('json-bigint', (measure) => {
      measure(() => jsonBigint.parse('"aaaaaa"'));
    });
  });


  describe('{"foo":"bar"}', () => {

    test('JSON', (measure) => {
      measure(() => JSON.parse('{"foo":"bar"}'));
    });

    test('lib', (measure) => {
      measure(() => parse('{"foo":"bar"}'));
    });

    test('json-bigint', (measure) => {
      measure(() => jsonBigint.parse('{"foo":"bar"}'));
    });
  });

}, {targetRme: 0.001});


describe('Stringify', () => {

  describe('package-lock.json', () => {

    test('JSON', (measure) => {
      measure(() => JSON.stringify(packageLockJson));
    });

    test('lib', (measure) => {
      measure(() => stringify(packageLockJson));
    });

    test('json-bigint', (measure) => {
      measure(() => jsonBigint.stringify(packageLockJson));
    });
  });


  describe('package.json', () => {

    test('JSON', (measure) => {
      measure(() => JSON.stringify(packageJson));
    });

    test('lib', (measure) => {
      measure(() => stringify(packageJson));
    });

    test('json-bigint', (measure) => {
      measure(() => jsonBigint.stringify(packageJson));
    });
  });


  describe('"aaaaaa"', () => {

    test('JSON', (measure) => {
      measure(() => JSON.stringify('aaaaaa'));
    });

    test('lib', (measure) => {
      measure(() => stringify('aaaaaa'));
    });

    test('json-bigint', (measure) => {
      measure(() => jsonBigint.stringify('aaaaaa'));
    });
  });


  describe('{"foo":"bar"}', () => {

    const value = {'foo': 'bar'};

    test('JSON', (measure) => {
      measure(() => JSON.stringify(value));
    });

    test('lib', (measure) => {
      measure(() => stringify(value));
    });

    test('json-bigint', (measure) => {
      measure(() => jsonBigint.stringify(value));
    });
  });

}, {targetRme: 0.001});
