export function uuid(): string;

export function documentHeight(): number;

export function isElement(obj: object): boolean;

export function isNumber(n: any): boolean;

export function isFloat(n: any): boolean;

export function prefixed(unprefixed: string): string;

export function defaults(obj: object): object;

export function extend(target: object): object;

export function insert(item: any, array: Array<any>, compareFunction: Function): number;

export function locationOf(item: any, array: Array<any>, compareFunction: Function, _start: Function, _end: Function): number;

export function indexOfSorted(item: any, array: Array<any>, compareFunction: Function, _start: Function, _end: Function): number;

export function bounds(el: Element): { width: Number, height: Number};

export function borders(el: Element): { width: Number, height: Number};

export function nodeBounds(node: Node): object;

export function windowBounds(): { width: Number, height: Number, top: Number, left: Number, right: Number, bottom: Number };

export function indexOfNode(node: Node, typeId: string): number;

export function indexOfTextNode(textNode: Node): number;

export function indexOfElementNode(elementNode: Element): number;

export function isXml(ext: string): boolean;

export function createBlob(content: any, mime: string): Blob;

export function createBlobUrl(content: any, mime: string): string;

export function revokeBlobUrl(url: string): void;

export function createBase64Url(content: any, mime: string): string

export function type(obj: object): string;

export function parse(markup: string, mime: string, forceXMLDom: boolean): Document;

export function qs(el: Element, sel: string): Element;

export function qsa(el: Element, sel: string): ArrayLike<Element>;

export function qsp(el: Element, sel: string, props: Array<object>): ArrayLike<Element>;

export function sprint(root: Node, func: Function): void;

export function treeWalker(root: Node, func: Function, filter: object | Function): void;

export function walk(node: Node, callback: Function): void;

export function blob2base64(blob: Blob): string;

export function defer(): Promise<any>;

export function querySelectorByType(html: Element, element: string, type: string): Array<Element>;

export function findChildren(el: Element): Array<Element>;

export function parents(node: Element): Array<Element>;

export function filterChildren(el: Element, nodeName: string, single: boolean): Array<Element>;

export function getParentByTagName(node: Element, tagname: string): Array<Element>;

export class RangeObject extends Range {

}
