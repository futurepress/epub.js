import { PackagingManifestObject } from "./packaging";
import Archive from "./archive";

export default class Resources {
  constructor(manifest: PackagingManifestObject, options: {
    replacements?: string,
    archive?: Archive,
    resolver?: Function,
    request?: Function
  });

  process(manifest: PackagingManifestObject): void;

  createUrl(url: string): Promise<string>;

  replacements(): Promise<Array<string>>;

  relativeTo(absolute: boolean, resolver?: Function): Array<string>;

  get(path: string): string;

  substitute(content: string, url?: string): string;

  destroy(): void;

  private split(): void;

  private splitUrls(): void;

  private replaceCss(archive: Archive, resolver?: Function): Promise<Array<string>>;

  private createCssFile(href: string): Promise<string>;
}
