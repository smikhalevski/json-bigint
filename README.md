# json-bigint [![build](https://github.com/smikhalevski/json-bigint/actions/workflows/master.yml/badge.svg?branch=master&event=push)](https://github.com/smikhalevski/json-bigint/actions/workflows/master.yml)

The symmetrical, backward compatible, and unambiguous JSON serializer/parser with bigint support.

```shell
npm install --save @smikhalevski/json-bigint
```

# Usage

Integers from JSON are parsed as `BigInt` while float numbers are parsed as `number`. 

```ts
import * as JsonBigInt from '@smikhalevski/json-bigint';

JsonBigInt.stringify({foo: 123n, bar: 123}); // → '{"foo":123,"bar":123.0}'

JsonBigInt.parse('{"foo":123,"bar":123.0}'); // → {foo: 123n, bar: 123}
```

You can create custom parsers and serializers:

```ts
import bigint from 'bigint';
import {createJsonParser, createJsonStringifier} from '@smikhalevski/json-bigint';

const stringifyJson = createJsonStringifier({
  isBigInt: (value) => value instanceof bigint,
  stringifyBigInt: (value) => value.toString(),
});

const parseJson = createJsonParser({
  parseBigInt: (str) => bigint(str),
});

stringifyJson({foo: bigint(123), bar: 123}); // → '{"foo":123,"bar":123.0}'

parseJson('{"foo":123,"bar":123.0}'); // → {foo: bigint(123), bar: 123}
```

# Performance

Clone this repo and use `npm ci && npm run perf` to run the performance testsuite.

Results are in operations per second. The higher number is better.

|  | native JSON | @smikhalevski/json-bigint | [@sidorares/json-bigint](https://github.com/sidorares/json-bigint) |
| --------- | ---: | ---: | ---: |
| parse     | 49 352 | 15 136 | 8 874  |
| stringify | 55 066 | 27 529 | 17 210 |
