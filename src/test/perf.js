const {parse, stringify} = require('../../lib/index-cjs');
const jsonBigint = require('json-bigint');

const packageLockJson = require('../../package-lock.json');
const packageJson = require('../../package.json');

const packageLockStr = JSON.stringify(packageLockJson);
const packageStr = JSON.stringify(packageJson);

const nextVersion = 'v' + packageJson.version;

describe('Parse', () => {

  describe('package-lock.json', () => {

    test('JSON', (measure) => {
      measure(() => JSON.parse(packageLockStr));
    });

    test(nextVersion, (measure) => {
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

    test(nextVersion, (measure) => {
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

    test(nextVersion, (measure) => {
      measure(() => parse('"aaaaaa"'));
    });

    test('json-bigint', (measure) => {
      measure(() => jsonBigint.parse('"aaaaaa"'));
    });
  });

  describe('"aaa\\nbbb\\nccc"', () => {

    test('JSON', (measure) => {
      measure(() => JSON.parse('"aaa\\nbbb\\nccc"'));
    });

    test(nextVersion, (measure) => {
      measure(() => parse('"aaa\\nbbb\\nccc"'));
    });

    test('json-bigint', (measure) => {
      measure(() => jsonBigint.parse('"aaa\\nbbb\\nccc"'));
    });
  });

  describe('{"foo":"bar"}', () => {

    test('JSON', (measure) => {
      measure(() => JSON.parse('{"foo":"bar"}'));
    });

    test(nextVersion, (measure) => {
      measure(() => parse('{"foo":"bar"}'));
    });

    test('json-bigint', (measure) => {
      measure(() => jsonBigint.parse('{"foo":"bar"}'));
    });
  });

  describe('{"foo":123.456}', () => {

    test('JSON', (measure) => {
      measure(() => JSON.parse('{"foo":123.456}'));
    });

    test(nextVersion, (measure) => {
      measure(() => parse('{"foo":123.456}'));
    });

    test('json-bigint', (measure) => {
      measure(() => jsonBigint.parse('{"foo":123.456}'));
    });
  });

  describe('{"foo":123456}', () => {

    test('JSON', (measure) => {
      measure(() => JSON.parse('{"foo":123456}'));
    });

    test(nextVersion, (measure) => {
      measure(() => parse('{"foo":123456}'));
    });

    test('json-bigint', (measure) => {
      measure(() => jsonBigint.parse('{"foo":123456}'));
    });
  });

}, {targetRme: 0.001});


describe('Stringify', () => {

  describe('package-lock.json', () => {

    test('JSON', (measure) => {
      measure(() => JSON.stringify(packageLockJson));
    });

    test(nextVersion, (measure) => {
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

    test(nextVersion, (measure) => {
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

    test(nextVersion, (measure) => {
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

    test(nextVersion, (measure) => {
      measure(() => stringify(value));
    });

    test('json-bigint', (measure) => {
      measure(() => jsonBigint.stringify(value));
    });
  });

}, {targetRme: 0.001});
