export default class Path {
  constructor(pathString: string);

  parse(what: string): object;

  isAbsolute(what: string): boolean;

  isDirectory(what: string): boolean;

  resolve(what: string): string;

  relative(what: string): string;

  splitPath(filename: string): string;

  toString(): string;
}
