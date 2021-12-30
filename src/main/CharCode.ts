// This enum isn't imported in compiled code.
export const enum CharCode {

  // An enum member cannot have a numeric name but not for const enums.
  // @ts-ignore
  '0' = 48, '1' = 49, '9' = 57,

  ' ' = 32,
  '\b' = 8,
  '\t' = 9,
  '\n' = 10,
  '\f' = 12,
  '\r' = 13,
  '{' = 123,
  '}' = 125,
  '[' = 91,
  ']' = 93,
  ',' = 44,
  ':' = 58,
  '"' = 34,
  '-' = 45,
  '+' = 43,
  '.' = 46,
  'e' = 101,
  'E' = 69,
  '\\' = 92,
  '/' = 47,
  'b' = 98,
  't' = 116,
  'n' = 110,
  'f' = 102,
  'r' = 114,
  'u' = 117,
}
