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

export function encode(str: string): string {
  encodeRe.lastIndex = 0;
  return encodeRe.test(str) ? '"' + str.replace(encodeRe, replaceEncoded) + '"' : '"' + str + '"';
}

function replaceEncoded(char: string): string {
  return encodeMap.hasOwnProperty(char) ? encodeMap[char] : '\\u' + ('000' + char.charCodeAt(0).toString(16)).slice(-4);
}
