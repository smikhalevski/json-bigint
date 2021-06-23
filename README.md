# json-bigint

The symmetrical, backward compatible, and unambiguous JSON serializer/parser with bigint support.

Integers from JSON are parsed as `BigInt` while float numbers are parsed as `number`. 

```ts
import JsonBigint from 'json-bigint';

JsonBigint.parse('{"foo":123, "bar":123.0}'); // → {foo: 123n, bar: 123}
```

Supports custom bigint parsers:

```ts
import bigint from 'bigint';
import {createJsonParser} from 'json-bigint';

const parseJson = createJsonParser({
  bigIntParser: (str) => bigint(str),
});

parseJson('{"foo":123, "bar":123.0}'); // → {foo: bigint(123), bar: 123}
```
