export function die(message?: string, offset?: number): never {
  throw new SyntaxError(message == null || offset == null ? message : message + ' at position ' + offset);
}
