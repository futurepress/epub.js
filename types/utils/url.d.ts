import Path from "./path";

export default class Url {
  constructor(urlString: string, baseString: string);

  path(): Path;

  resolve(what: string): string;

  relative(what: string): string;

  toString(): string;
}
