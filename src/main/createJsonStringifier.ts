import {encode} from './decoder';
import {JsonStringifier, Replacer} from './types';

const LINE_FEED = '\n';

const hasOwnProperty = Object.prototype.hasOwnProperty;

export function createJsonStringifier(): JsonStringifier {
  return (value, replacer, space) => {

    let fields = null;
    if (replacer !== null && typeof replacer === 'object' && typeof replacer.length === 'number' && replacer.length > 0) {
      fields = new Set<string>();

      for (let i = 0; i < replacer.length; i++) {
        const value = replacer[i];
        if (typeof value === 'string' || typeof value === 'number') {
          fields.add('' + value);
        }
      }
      if (fields.size === 0) {
        fields = null;
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

    return stringify({'': value}, '', replacer, fields, '', padding) as string;
  };
}

function stringify(parent: any, key: string, replacer: Replacer | null, fields: Set<string> | null, outerPadding: string, padding: string): string | undefined {

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

  switch (typeof value) {

    case 'string':
      return encode(value);

    case 'number':
      if (!isFinite(value)) {
        return 'null';
      }
      if (value % 1 === 0) {
        return value.toFixed(1);
      }
      return '' + value;

    case 'bigint':
      return '' + value;

    case 'object':

      const padded = padding.length !== 0;
      const innerPadding = outerPadding + padding;

      if (Array.isArray(value)) {
        let json = '[';
        if (padded) {
          json += LINE_FEED;
        }

        let i = 0;
        while (i < value.length) {
          if (i !== 0) {
            json += ',';
            if (padded) {
              json += LINE_FEED;
            }
          }

          const res = stringify(value, '' + i, replacer, fields, innerPadding, padding);

          if (res !== undefined) {
            json += innerPadding + res;
          } else {
            json += innerPadding + 'null';
          }
          i++;
        }
        if (padded && i !== 0) {
          json += LINE_FEED;
        }
        return json += outerPadding + ']';
      }

      let separated = false;
      let json = '{';
      if (padded) {
        json += LINE_FEED;
      }

      for (const key in value) {
        if (!hasOwnProperty.call(value, key) || fields !== null && !fields.has(key)) {
          continue;
        }

        const res = stringify(value, key, replacer, fields, innerPadding, padding);

        if (res !== undefined) {
          if (separated) {
            json += ',';
            if (padded) {
              json += LINE_FEED;
            }
          } else {
            separated = true;
          }
          json += innerPadding + encode(key) + ':' + res;
        }
      }
      if (padded && separated) {
        json += LINE_FEED;
      }
      return json += outerPadding + '}';
  }
}
