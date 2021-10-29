# json-bigint

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

You can create parsers and serializers:

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
