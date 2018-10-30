import { HooksObject } from "./utils/hook";

export interface GlobalLayout {
  layout: string,
  spread: string,
  orientation: string
}

export interface LayoutSettings {
  layout: string,
  spread: string,
  orientation: string
}

export interface SpineItem {
  index: number,
  cfiBase: string,
  href?: string,
  url?: string,
  canonical?: string,
  properties?: Array<string>,
  linear?: string,
  next: () => SpineItem,
  prev: () => SpineItem,
}

export default class Section {
  constructor(item: SpineItem, hooks: HooksObject);

  idref: string;
  linear: boolean;
  properties: Array<string>;
  index: number;
  href: string;
  url: string;
  canonical: string;
  next: () => SpineItem;
  prev: () => SpineItem;
  cfiBase: string;

  document: Document;
  contents: Element;
  output: string;

  hooks: HooksObject;

  load(_request?: Function): Document;

  render(_request?: Function): string;

  find(_query: string): Array<Element>;

  reconcileLayoutSettings(globalLayout: GlobalLayout): LayoutSettings;

  cfiFromRange(_range: Range): string;

  cfiFromElement(el: Element): string;

  unload(): void;

  destroy(): void;

  private base(): void;
}
