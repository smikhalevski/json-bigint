export interface ParserContext {
  stack: any[];
  cursor: number;
  arrayMode: boolean;
  objectKey: string | null;
  parseBigInt: (str: string) => unknown;
}
