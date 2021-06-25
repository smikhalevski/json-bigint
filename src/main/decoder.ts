const encodeRe = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
const encodeMap: Record<string, string> = {
  '\b': '\\b',
  '\t': '\\t',
  '\n': '\\n',
  '\f': '\\f',
  '\r': '\\r',
  '"': '\\"',
  '\\': '\\\\',
};

const decodeRe = /\\(?:[btnfr"\\\/]|u[0-9a-fA-F]{4}|)/g;
const decodeMap: Record<string, string> = {
  '\\b': '\b',
  '\\t': '\t',
  '\\n': '\n',
  '\\f': '\f',
  '\\r': '\r',
  '\\"': '"',
  '\\\\': '\\',
  '\\/': '/',
};

export function encode(str: string): string {
  encodeRe.lastIndex = 0;
  return encodeRe.test(str) ? '"' + str.replace(encodeRe, replaceEncoded) + '"' : '"' + str + '"';
}

function replaceEncoded(char: string): string {
  return encodeMap.hasOwnProperty(char) ? encodeMap[char] : '\\u' + ('000' + char.charCodeAt(0).toString(16)).slice(-4);
}

export function decode(str: string): string {
  decodeRe.lastIndex = 0;
  return decodeRe.test(str) ? str.replace(decodeRe, replaceDecoded) : str;
}

function replaceDecoded(str: string): string {
  if (str.length === 1) {
    throw new SyntaxError('Unexpected char');
  }
  return str.length === 6 ? String.fromCharCode(parseInt(str.substr(2), 16)) : decodeMap[str];
}
