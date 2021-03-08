import {
  PackagingManifestObject,
  PackagingMetadataObject,
  PackagingSpineItem,
  PackagingObject
} from "./packaging";
import Rendition, { RenditionOptions } from "./rendition";
import Section, { SpineItem } from "./section";
import Archive from "./archive";
import Navigation from "./navigation";
import PageList, {PageListItem} from "./pagelist";
import Spine from "./spine";
import Locations from "./locations";
import Url from "./utils/url";
import Path from "./utils/path";
import Resources from "./resources";
import Container from "./container";
import Packaging from "./packaging";
import Store from "./store";

export interface BookOptions {
  requestMethod?: (url: string, type: string, withCredentials: object, headers: object) => Promise<object>;
  requestCredentials?: object,
  requestHeaders?: object,
  encoding?: string,
  replacements?: string,
  canonical?: (path: string) => string,
  openAs?: string,
  store?: string
}

export default class Book {
    constructor(url: string, options?: BookOptions);
    constructor(options?: BookOptions);

    settings: BookOptions;
    opening: any; // should be core.defer
    opened: Promise<Book>;
    isOpen: boolean;
    loaded: {
      metadata: Promise<PackagingMetadataObject>,
      spine: Promise<SpineItem[]>,
      manifest: Promise<PackagingManifestObject>,
      cover: Promise<string>,
      navigation: Promise<Navigation>,
      pageList: Promise<PageListItem[]>,
      resources: Promise<string[]>,
    }
    ready: Promise<void>;
    request: Function;
    spine: Spine;
    locations: Locations;
    navigation: Navigation;
    pageList: PageList;
    url: Url;
    path: Path;
    archived: boolean;
    archive: Archive;
    resources: Resources;
    rendition: Rendition
    container: Container;
    packaging: Packaging;
    storage: Store;


    canonical(path: string): string;

    coverUrl(): Promise<string | null>;

    destroy(): void;

    determineType(input: string): string;

    getRange(cfiRange: string): Promise<Range>;

    key(identifier?: string): string;

    load(path: string): Promise<object>;

    loadNavigation(opf: XMLDocument): Promise<Navigation>;

    open(input: string, what?: string): Promise<object>;
    open(input: ArrayBuffer, what?: string): Promise<object>;

    openContainer(url: string): Promise<string>;

    openEpub(data: BinaryType, encoding?: string): Promise<Book>;

    openManifest(url: string): Promise<Book>;

    openPackaging(url: string): Promise<Book>;

    renderTo(element: Element, options?: RenditionOptions): Rendition;
    renderTo(element: string, options?: RenditionOptions): Rendition;

    private replacements(): Promise<void>;

    resolve(path: string, absolute?: boolean): string;

    section(target: string): Section;
    section(target: number): Section;

    setRequestCredentials(credentials: object): void;

    setRequestHeaders(headers: object): void;

    unarchive(input: BinaryType, encoding?: string): Promise<Archive>;

    store(name: string): Store;

    unpack(opf: XMLDocument): Promise<Book>;

    // Event emitters
    emit(type: any, ...args: any[]): void;

    off(type: any, listener: any): any;

    on(type: any, listener: any): any;

    once(type: any, listener: any, ...args: any[]): any;

}
