export interface ParserContext {
  stack: any[];
  cursor: number;
  arrayMode: boolean;
  objectKey: string | null;
  input: string;
  parseBigInt: (str: string) => unknown;
}
