export interface PageListItem {
  href: string,
  page: string,
  cfi?: string,
  packageUrl?: string
}

export default class Pagelist {
  constructor(xml: XMLDocument);

  parse(xml: XMLDocument): Array<PageListItem>;

  pageFromCfi(cfi: string): string;

  cfiFromPage(pg: string): string;

  pageFromPercentage(percent: number): string;

  percentageFromPage(pg: string): number;

  hrefFromPage(pg: string): string;

  destroy(): void;

  private parseNav(navHtml: Node): Array<PageListItem>;

  private item(item: Node): PageListItem;

  private process(pageList: Array<PageListItem>): void;

}
