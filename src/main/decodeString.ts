import {CharCode} from './CharCode';
import {die} from './utils';

export function decodeString(input: string): string {
  let takenStr = '';
  let offset = 0;

  let escapeOffset = input.indexOf('\\');

  if (escapeOffset === -1) {
    return input;
  }

  do {

    const chunkStr = input.substring(offset, escapeOffset);

    switch (input.charCodeAt(escapeOffset + 1)) {

      case CharCode['"']:
        takenStr += chunkStr + '"';
        offset = escapeOffset + 2;
        break;

      case CharCode['\\']:
        takenStr += chunkStr + '\\';
        offset = escapeOffset + 2;
        break;

      case CharCode['/']:
        takenStr += chunkStr + '/';
        offset = escapeOffset + 2;
        break;

      case CharCode['b']:
        takenStr += chunkStr + '\b';
        offset = escapeOffset + 2;
        break;

      case CharCode['t']:
        takenStr += chunkStr + '\t';
        offset = escapeOffset + 2;
        break;

      case CharCode['n']:
        takenStr += chunkStr + '\n';
        offset = escapeOffset + 2;
        break;

      case CharCode['f']:
        takenStr += chunkStr + '\f';
        offset = escapeOffset + 2;
        break;

      case CharCode['r']:
        takenStr += chunkStr + '\r';
        offset = escapeOffset + 2;
        break;

      case CharCode['u']:
        const charCode = parseInt(input.substr(escapeOffset + 2, 4), 16);

        if (isNaN(charCode)) {
          die('Invalid UTF code');
        }
        takenStr += chunkStr + String.fromCharCode(charCode);
        offset = escapeOffset + 6;
        break;

      default:
        die('Illegal escape char');
    }

    escapeOffset = input.indexOf('\\', offset);

  } while (escapeOffset !== -1);

  return takenStr + input.substring(offset);
}
