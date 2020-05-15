import EpubCFI from "./epubcfi";

export interface ViewportSettings {
  width: string,
  height: string,
  scale: string,
  scalable: string,
  minimum: string,
  maximum: string
}

export default class Contents {
    constructor(doc: Document, content: Element, cfiBase: string, sectionIndex: number);

    epubcfi: EpubCFI;
    document: Document;
    documentElement: Element;
    content: Element;
    window: Window;
    sectionIndex: number;
    cfiBase: string;

    static listenedEvents: string[];

    addClass(className: string): void;

    addScript(src: string): Promise<boolean>;

    addStylesheet(src: string): Promise<boolean>;

    addStylesheetRules(rules: Array<object> | object, key: string): Promise<boolean>;

    addStylesheetCss(serializedCss: string, key: string): Promise<boolean>;

    cfiFromNode(node: Node, ignoreClass?: string): string;

    cfiFromRange(range: Range, ignoreClass?: string): string;

    columns(width: number, height: number, columnWidth: number, gap: number, dir: string): void;

    contentHeight(h: number): number;

    contentWidth(w: number): number;

    css(property: string, value: string, priority?: boolean): string;

    destroy(): void;

    direction(dir: string): void;

    fit(width: number, height: number): void;

    height(h: number): number;

    locationOf(target: string | EpubCFI, ignoreClass?: string): Promise<{ top: number, left: number }>;

    map(layout: any): any;

    mapPage(cfiBase: string, layout: object, start: number, end: number, dev: boolean): any;

    overflow(overflow: string): string;

    overflowX(overflow: string): string;

    overflowY(overflow: string): string;

    range(cfi: string, ignoreClass?: string): Range;

    removeClass(className: any): void;

    root(): Element;

    scaler(scale: number, offsetX: number, offsetY: number): void;

    scrollHeight(): number;

    scrollWidth(): number;

    size(width: number, height: number): void;

    textHeight(): number;

    textWidth(): number;

    viewport(options: ViewportSettings): ViewportSettings;

    width(w: number): number;

    writingMode(mode: string): string;

    // Event emitters
    emit(type: any, ...args: any[]): void;

    off(type: any, listener: any): any;

    on(type: any, listener: any): any;

    once(type: any, listener: any, ...args: any[]): any;

    private addEventListeners(): void;

    private addSelectionListeners(): void;

    private epubReadingSystem(name: string, version: string): object;

    private expand(): void;

    private fontLoadListeners(): void;

    private imageLoadListeners(): void;

    private layoutStyle(style: string): string;

    private linksHandler(): void;

    private listeners(): void;

    private mediaQueryListeners(): void;

    private onSelectionChange(e: Event): void;

    private removeEventListeners(): void;

    private removeListeners(): void;

    private removeSelectionListeners(): void;

    private resizeCheck(): void;

    private resizeListeners(): void;

    private resizeObservers(): void;

    private transitionListeners(): void;

    private triggerEvent(e: Event): void;

    private triggerSelectedEvent(selection: Selection): void;
}
