import Rendition from "./rendition";
import View from "./managers/view";

export default class Annotations {
  constructor(rendition: Rendition);

  add(type: string, cfiRange: string, data?: object, cb?: Function, className?: string, styles?: object): Annotation;

  remove(cfiRange: string, type: string): void;

  highlight(cfiRange: string, data?: object, cb?: Function, className?: string, styles?: object): void;

	underline(cfiRange: string, data?: object, cb?: Function, className?: string, styles?: object): void;

	mark(cfiRange: string, data?: object, cb?: Function): void;

  each(): Array<Annotation>

  private _removeFromAnnotationBySectionIndex(sectionIndex: number, hash: string): void;

  private _annotationsAt(index: number): void;

  private inject(view: View): void;

  private clear(view: View): void;
}

declare class Annotation {
  constructor(options: {
		type: string,
		cfiRange: string,
		data?: object,
		sectionIndex?: number,
		cb?: Function,
		className?: string,
		styles?: object
	});

  update(data: object): void;

  attach(view: View): any;

  detach(view: View): any;

  // Event emitters
  emit(type: any, ...args: any[]): void;

  off(type: any, listener: any): any;

  on(type: any, listener: any): any;

  once(type: any, listener: any, ...args: any[]): any;
}
