export interface PageListItem {
  href: string,
  page: string,
  cfi?: string,
  packageUrl?: string
}

export default class Pagelist {
  constructor(xml: XMLDocument);

  parse(xml: XMLDocument): Array<PageListItem>;

  pageFromCfi(cfi: string): number;

  cfiFromPage(pg: string | number): string;

  pageFromPercentage(percent: number): number;

  percentageFromPage(pg: number): number;

  destroy(): void;

  private parseNav(navHtml: Node): Array<PageListItem>;

  private item(item: Node): PageListItem;

  private process(pageList: Array<PageListItem>): void;

}
