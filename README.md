# json-otter 🦦  [![build](https://github.com/smikhalevski/json-otter/actions/workflows/master.yml/badge.svg?branch=master&event=push)](https://github.com/smikhalevski/json-otter/actions/workflows/master.yml)

The highly performant, symmetrical, backward compatible, and unambiguous JSON serializer/parser with `BigInt` support.

```shell
npm install --save json-otter
```

# Usage

Integers from JSON are parsed as `BigInt` while float numbers are parsed as `number`.

```ts
import {stringify, parse} from 'json-otter';

stringify({foo: 123n, bar: 123});
// → '{"foo":123,"bar":123.0}'

parse('{"foo":123,"bar":123.0}');
// → {foo: 123n, bar: 123}
```

You can use customize parser and serializer:

```ts
import {stringify, parse} from 'json-otter';
import bigint from 'bigint';

stringify({foo: bigint(123), bar: 123}, /*replacer*/ undefined, /*space*/ undefined, {

  isBigInt(value) {
    return value instanceof bigint;
  },

  stringifyBigInt(value) {
    return value.toString();
  }
});
// → '{"foo":123,"bar":123.0}'

parse('{"foo":123,"bar":123.0}', /*reviver*/ undefined, bigint);
// → {foo: bigint(123), bar: 123}
```

# Performance

Clone this repo and use `npm ci && npm run perf` to run the performance testsuite.

Results are in operations per second. The higher number is better.

### Parse

|                                          |  `JSON` | json-otter | [json-bigint](https://github.com/sidorares/json-bigint) |
|------------------------------------------|--------:|-----------:|--------------------------------------------------------:|
| [package-lock.json](./package-lock.json) |   1,396 |        988 |                                                     453 |
| [package.json](./package.json)           | 240,184 |    139,706 |                                                  61,738 |
| `"aaaaaa"`                               |  4.42 M |    13.31 M |                                                  8.26 M |
| `"aaa\nbbb\nccc"`                        |  4.55 M |     6.63 M |                                                  4.41 M |
| `{"foo":"bar"}`                          |  3.17 M |     4.80 M |                                                  1.97 M |
| `{"foo":123.456}`                        |  3.11 M |     3.71 M |                                                  1.55 M |
| `{"foo":123456}`                         |  3.32 M |     3.82 M |                                                  1.69 M |

### Stringify

|                                          |  `JSON` | json-otter | [json-bigint](https://github.com/sidorares/json-bigint) |
|------------------------------------------|--------:|-----------:|--------------------------------------------------------:|
| [package-lock.json](./package-lock.json) |   2,711 |      1,382 |                                                     916 |
| [package.json](./package.json)           | 238,456 |    164,309 |                                                 119,040 |
| `"aaaaaa"`                               |  6.35 M |    21.06 M |                                                 19.97 M |
| `{"foo":"bar"}`                          |  4.50 M |     7.68 M |                                                  5.62 M |
