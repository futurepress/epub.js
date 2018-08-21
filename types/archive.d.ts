import JSZip = require('jszip');

export default class Archive {
  constructor();

  open(input: BinaryType, isBase64?: boolean): Promise<JSZip>;

  openUrl(zipUrl: string, isBase64?: boolean): Promise<JSZip>;

	request(url: string, type?: string): Promise<Blob | string | JSON | Document | XMLDocument>;

  getBlob(url: string, mimeType?: string): Promise<Blob>;

  getText(url: string): Promise<string>;

  getBase64(url: string, mimeType?: string): Promise<string>;

  createUrl(url: string, options: { base64: boolean }): Promise<string>;

  revokeUrl(url: string): void;

  destroy(): void;

  private checkRequirements(): void;

  private handleResponse(response: any, type?: string): Blob | string | JSON | Document | XMLDocument;
}
