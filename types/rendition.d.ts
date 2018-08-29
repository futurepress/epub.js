import Book from "./book";
import Contents from "./contents";
import Section from "./section";
import View from "./managers/view";
import Hook from "./utils/hook";
import Themes from "./themes";
import EpubCFI from "./epubcfi";
import Annotations from "./annotations";
import Queue from "./utils/queue";

export interface RenditionOptions {
  width?: number,
  height?: number,
  ignoreClass?: string,
  manager?: string | Function | object,
  view?: string | Function | object,
  layout?: string,
  spread?: string,
  minSpreadWidth?: number,
  stylesheet?: string,
  script?: string
}

export interface DisplayedLocation {
  index: number,
  href: string,
  cfi: string,
  displayed: {
    page: number,
    total: number
  }
}

export interface Location {
  start: DisplayedLocation,
	end: DisplayedLocation,
  atStart: boolean,
  atEnd: boolean
}

export default class Rendition {
    constructor(book: Book, options: RenditionOptions);

    settings: RenditionOptions;
    book: Book;
    hooks: {
      display: Hook,
      serialize: Hook,
      content: Hook,
      unloaded: Hook,
      layout: Hook,
      render: Hook,
      show: Hook
    }
    themes: Themes;
    annotations: Annotations;
    epubcfi: EpubCFI;
    q: Queue;
    location: Location;
    started: Promise<void>;

    adjustImages(contents: Contents): Promise<void>;

    attachTo(element: Element): Promise<void>;

    clear(): void;

    currentLocation(): DisplayedLocation;
    currentLocation(): Promise<DisplayedLocation>;

    destroy(): void;

    determineLayoutProperties(metadata: object): object;

    direction(dir: string): void;

    display(target?: string): Promise<void>;
    display(target?: number): Promise<void>;

    flow(flow: string): void;

    getContents(): Contents;

    getRange(cfi: string, ignoreClass?: string): Range;

    handleLinks(contents: Contents): void;

    injectIdentifier(doc: Document, section: Section): void;

    injectScript(doc: Document, section: Section): void;

    injectStylesheet(doc: Document, section: Section): void;

    layout(settings: any): any;

    located(location: Location): DisplayedLocation;

    moveTo(offset: number): void;

    next(): Promise<void>;

    onOrientationChange(orientation: string): void;

    passEvents(contents: Contents): void;

    prev(): Promise<void>;

    reportLocation(): Promise<void>;

    requireManager(manager: string | Function | object): any;

    requireView(view: string | Function | object): any;

    resize(width: number, height: number): void;

    setManager(manager: Function): void;

    spread(spread: string, min?: number): void;

    start(): void;

    views(): Array<View>;

    // Event emitters
    emit(type: any, ...args: any[]): void;

    off(type: any, listener: any): any;

    on(type: any, listener: any): any;

    once(type: any, listener: any, ...args: any[]): any;

    private triggerMarkEvent(cfiRange: string, data: object, contents: Contents): void;

    private triggerSelectedEvent(cfirange: string, contents: Contents): void;

    private triggerViewEvent(e: Event, contents: Contents): void;

    private onResized(size: { width: number, height: number }): void;

    private afterDisplayed(view: any): void;

    private afterRemoved(view: any): void;

}
