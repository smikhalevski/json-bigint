const reChar = /[\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

/**
 * Encode string as JSON.
 */
export function encodeString(str: string): string {
  reChar.lastIndex = 0;
  return reChar.test(str) ? '"' + str.replace(reChar, replaceChar) + '"' : '"' + str + '"';
}

function replaceChar(char: string): string {
  const charCode = char.charCodeAt(0);

  switch (charCode) {
    case 8:
      return '\\b';
    case 9:
      return '\\t';
    case 10:
      return '\\n';
    case 12:
      return '\\f';
    case 13:
      return '\\r';
    case 92:
      return '\\\\';
    case 34:
      return '\\"';
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
