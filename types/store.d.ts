import localForage = require('localforage');
import Resources from "./resources";

export default class Store {
  constructor();

  add(resources: Resources, force?: boolean): Promise<Array<object>>;

  put(url: string): Promise<Blob>;

  request(url: string, type?: string, withCredentials?: boolean, headers?: object): Promise<Blob | string | JSON | Document | XMLDocument>;

  retrieve(url: string, type?: string): Promise<Blob | string | JSON | Document | XMLDocument>;

  getBlob(url: string, mimeType?: string): Promise<Blob>;

  getText(url: string): Promise<string>;

  getBase64(url: string, mimeType?: string): Promise<string>;

  createUrl(url: string, options: { base64: boolean }): Promise<string>;

  revokeUrl(url: string): void;

  destroy(): void;

  private checkRequirements(): void;

  private handleResponse(response: any, type?: string): Blob | string | JSON | Document | XMLDocument;
}
