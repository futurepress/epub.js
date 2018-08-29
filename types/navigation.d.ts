export interface NavItem {
  id?: string,
  href?: string,
  label?: string,
  subitems?: Array<NavItem>,
  parent?: NavItem
}

export interface LandmarkItem {
  href?: string,
  label?: string,
  type?: string
}

export default class Navigation {
  constructor(xml: XMLDocument);

  parse(xml: XMLDocument): void;

  get(target: string) : NavItem;

  landmark(type: string) : LandmarkItem;

  load(json: JSON): Array<NavItem>;

  forEach(fn: (item: NavItem) => {}): any;

  private unpack(toc: Array<NavItem>): void;

  private parseNav(navHtml: XMLDocument): Array<NavItem>;

  private navItem(item: Element): NavItem;

  private parseLandmarks(navHtml: XMLDocument): Array<LandmarkItem>;

  private landmarkItem(item: Element): LandmarkItem;

  private parseNcx(navHtml: XMLDocument): Array<NavItem>;

  private ncxItem(item: Element): NavItem;
}
