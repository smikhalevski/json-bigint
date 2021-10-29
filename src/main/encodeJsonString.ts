import {CharCode} from './CharCode';

const charPattern = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

export function encodeJsonString(str: string): string {
  charPattern.lastIndex = 0;
  return charPattern.test(str) ? '"' + str.replace(charPattern, replaceEncoded) + '"' : '"' + str + '"';
}

function replaceEncoded(char: string): string {
  const charCode = char.charCodeAt(0);

  switch (charCode) {
    case CharCode['\b']: return '\\b';
    case CharCode['\t']: return '\\t';
    case CharCode['\n']: return '\\n';
    case CharCode['\f']: return '\\f';
    case CharCode['\r']: return '\\r';
    case CharCode['\\']: return '\\\\';
    case CharCode['"']: return '\\"';
  }

  const str = charCode.toString(16);

  if (charCode > 0xFFF) {
    return '\\u' + str;
  }
  if (charCode > 0xFF) {
    return '\\u0' + str;
  }
  if (charCode > 0xF) {
    return '\\u00' + str;
  }

  return '\\u000' + str;
}
