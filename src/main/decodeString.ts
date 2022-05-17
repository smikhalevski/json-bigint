import {die} from './utils';

/**
 * Decodes a JSON-encoded string.
 */
export function decodeString(input: string, offset: number): string {
  let str = '';
  let index = 0;

  let escapeIndex = input.indexOf('\\');

  if (escapeIndex === -1) {
    return input;
  }

  do {
    const strChunk = input.substring(index, escapeIndex);

    switch (input.charCodeAt(escapeIndex + 1)) {

      case 34:
        str += strChunk + '"';
        index = escapeIndex + 2;
        break;

      case 92:
        str += strChunk + '\\';
        index = escapeIndex + 2;
        break;

      case 47:
        str += strChunk + '/';
        index = escapeIndex + 2;
        break;

      case 98:
        str += strChunk + '\b';
        index = escapeIndex + 2;
        break;

      case 116:
        str += strChunk + '\t';
        index = escapeIndex + 2;
        break;

      case 110:
        str += strChunk + '\n';
        index = escapeIndex + 2;
        break;

      case 102:
        str += strChunk + '\f';
        index = escapeIndex + 2;
        break;

      case 114:
        str += strChunk + '\r';
        index = escapeIndex + 2;
        break;

      case 117:
        const charCode = parseInt(input.substr(escapeIndex + 2, 4), 16);

        if (isNaN(charCode)) {
          die('Invalid UTF code', offset + escapeIndex);
        }
        str += strChunk + String.fromCharCode(charCode);
        index = escapeIndex + 6;
        break;

      default:
        die('Illegal escape token', offset + escapeIndex);
    }

    escapeIndex = input.indexOf('\\', index);

  } while (escapeIndex !== -1);

  return str + input.substring(index);
}
