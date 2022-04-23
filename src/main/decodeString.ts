import {CharCode} from './CharCode';
import {die} from './utils';

export function decodeString(input: string): string {
  let takenStr = '';
  let offset = 0;

  while (true) {

    const escI = input.indexOf('\\', offset);

    if (escI === -1) {
      return takenStr + input.substring(offset);
    }

    const chunkStr = input.substring(offset, escI);

    switch (input.charCodeAt(escI + 1)) {

      case CharCode['"']:
        takenStr += chunkStr + '"';
        offset = escI + 2;
        break;

      case CharCode['\\']:
        takenStr += chunkStr + '\\';
        offset = escI + 2;
        break;

      case CharCode['/']:
        takenStr += chunkStr + '/';
        offset = escI + 2;
        break;

      case CharCode['b']:
        takenStr += chunkStr + '\b';
        offset = escI + 2;
        break;

      case CharCode['t']:
        takenStr += chunkStr + '\t';
        offset = escI + 2;
        break;

      case CharCode['n']:
        takenStr += chunkStr + '\n';
        offset = escI + 2;
        break;

      case CharCode['f']:
        takenStr += chunkStr + '\f';
        offset = escI + 2;
        break;

      case CharCode['r']:
        takenStr += chunkStr + '\r';
        offset = escI + 2;
        break;

      case CharCode['u']:
        const charCode = parseInt(input.substr(escI + 2, 4), 16);

        if (isNaN(charCode)) {
          die('Invalid UTF code');
        }
        takenStr += chunkStr + String.fromCharCode(charCode);
        offset = escI + 6;
        break;

      default:
        die('Illegal escape char');
    }
  }
}

