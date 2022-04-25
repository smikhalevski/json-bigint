import {encodeString} from './encodeString';

export interface StringifyJsonOptions {

  /**
   * Returns `true` if value is a bigint instance.
   */
  isBigInt(value: any): boolean;

  /**
   * Converts a bigint instance to a string.
   */
  stringifyBigInt(value: any): string;
}

const stringifyJsonOptions: StringifyJsonOptions = {
  isBigInt: (value) => typeof value === 'bigint',
  stringifyBigInt: String,
};

export function stringifyJson(value: any, replacer?: ((this: any, key: string, value: any) => any) | Array<unknown> | null, space?: string | number | null, options: StringifyJsonOptions = stringifyJsonOptions): string {

  let replacerKeys: Set<string> | null = null;

  // Replacer can be array-like
  // noinspection SuspiciousTypeOfGuard
  if (replacer !== null && typeof replacer === 'object' && typeof replacer.length === 'number') {
    replacerKeys = new Set();

    for (const renderedKey of replacer) {
      if (typeof renderedKey === 'string' || typeof renderedKey === 'number') {
        replacerKeys.add('' + renderedKey);
      }
    }
  }

  if (typeof replacer !== 'function') {
    replacer = null;
  }

  const padding = typeof space === 'number' ? ' '.repeat(space) : typeof space === 'string' ? space : '';

  return traverseJson({'': value}, '', replacer, replacerKeys, '', padding, options)!;
}

function traverseJson(parent: any, key: string, replacer: ((this: any, key: string, value: any) => any) | null, renderedKeys: Set<string> | null, outerPadding: string, padding: string, options: StringifyJsonOptions): string | undefined {
  const {isBigInt, stringifyBigInt} = options;

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
    return encodeString(value);
  }

  if (valueType === 'number') {
    const fraction = value % 1;

    if (isNaN(fraction)) {
      // Infinity or NaN
      return 'null';
    }
    if (fraction === 0) {
      // Integer
      return value + '.0';
    }
    // Float
    return '' + value;
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
        json += '\n';
      }

      for (let i = 0; i < arrayLength; ++i) {
        if (i > 0) {
          json += ',';
          if (padded) {
            json += '\n';
          }
        }

        const childJson = traverseJson(value, '' + i, replacer, renderedKeys, innerPadding, padding, options) || 'null';
        json += innerPadding + childJson;
      }
      if (padded) {
        json += '\n';
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
      json += '\n';
    }

    for (const key of keys) {
      if (renderedKeys !== null && !renderedKeys.has(key)) {
        continue;
      }

      const childJson = traverseJson(value, key, replacer, renderedKeys, innerPadding, padding, options);

      if (childJson !== undefined) {
        if (separated) {
          json += ',';
          if (padded) {
            json += '\n';
          }
        } else {
          separated = true;
        }
        json += innerPadding + encodeString(key) + ':' + childJson;
      }
    }
    if (padded && separated) {
      json += '\n';
    }
    return json + outerPadding + '}';
  }

  // Undefined
  // noop
}
