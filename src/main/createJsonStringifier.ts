import {encodeJsonString} from './encodeJsonString';
import {IJsonStringifierOptions, JsonStringifier, Replacer} from './types';

const LINE_FEED = '\n';

export function createJsonStringifier(options: IJsonStringifierOptions): JsonStringifier {
  const {isBigInt, stringifyBigInt} = options;

  const stringifyJson = (parent: any, key: string, replacer: Replacer | null, renderedKeys: Set<string> | null, outerPadding: string, padding: string): string | undefined => {
    let value = parent[key];

    if (value !== null && typeof value === 'object' && typeof value.toJSON === 'function') {
      value = value.toJSON(key);
    }

    if (replacer) {
      value = replacer.call(parent, key, value);
    }

    if (value === null) {
      return 'null';
    }

    const valueType = typeof value;

    if (valueType === 'string') {
      return encodeJsonString(value);
    }

    if (valueType === 'number') {
      const remainder = value % 1;

      if (isNaN(remainder)) {
        // Infinity or NaN
        return 'null';
      }
      if (remainder === 0) {
        // Integer
        return value + '.0';
      }
      // Float
      return value.toString();
    }

    if (isBigInt(value)) {
      return stringifyBigInt(value);
    }

    if (valueType === 'object') {
      const padded = padding.length !== 0;
      const innerPadding = outerPadding + padding;

      // Array
      if (Array.isArray(value)) {
        const arrayLength = value.length;

        if (arrayLength === 0) {
          return '[]';
        }

        let json = '[';
        if (padded) {
          json += LINE_FEED;
        }

        for (let i = 0; i < arrayLength; ++i) {
          if (i > 0) {
            json += ',';
            if (padded) {
              json += LINE_FEED;
            }
          }

          const childJson = stringifyJson(value, '' + i, replacer, renderedKeys, innerPadding, padding) || 'null';
          json += innerPadding + childJson;
        }
        if (padded) {
          json += LINE_FEED;
        }
        return json + outerPadding + ']';
      }

      // Object
      const keys = Object.keys(value);

      if (keys.length === 0) {
        return '{}';
      }

      let separated = false;
      let json = '{';
      if (padded) {
        json += LINE_FEED;
      }

      for (const key of keys) {
        if (renderedKeys !== null && !renderedKeys.has(key)) {
          continue;
        }

        const childJson = stringifyJson(value, key, replacer, renderedKeys, innerPadding, padding);

        if (childJson !== undefined) {
          if (separated) {
            json += ',';
            if (padded) {
              json += LINE_FEED;
            }
          } else {
            separated = true;
          }
          json += innerPadding + encodeJsonString(key) + ':' + childJson;
        }
      }
      if (padded && separated) {
        json += LINE_FEED;
      }
      return json + outerPadding + '}';
    }

    // Undefined
  };

  return (value, replacer, space) => {

    let renderedKeys: Set<string> | null = null;

    if (replacer !== null && typeof replacer === 'object' && typeof replacer.length === 'number') {
      renderedKeys = new Set();

      for (const renderedKey of replacer) {
        if (typeof renderedKey === 'string' || typeof renderedKey === 'number') {
          renderedKeys.add(renderedKey.toString());
        }
      }
    }

    if (typeof replacer !== 'function') {
      replacer = null;
    }

    let padding = '';
    if (typeof space === 'number') {
      for (let i = 0; i < space; i++) {
        padding += ' ';
      }
    }
    if (typeof space === 'string') {
      padding = space;
    }

    return stringifyJson({'': value}, '', replacer, renderedKeys, '', padding)!;
  };
}
