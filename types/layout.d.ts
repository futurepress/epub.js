import Contents from "./contents";

interface LayoutSettings {
  layout: string,
  spread: string,
  minSpreadWidth: number,
  evenSpreads: boolean
}

export default class Layout {
  constructor(settings: LayoutSettings);

  settings: LayoutSettings;
  name: string;
  props: {
    name: string,
    spread: string,
    flow: string,
    width: number,
    height: number,
    spreadWidth: number,
    delta: number,
    columnWidth: number,
    gap: number,
    divisor: number
  };

  flow(flow: string): string;

  spread(spread: string, min: number): boolean;

  calculate(_width:number, _height:number, _gap?:number): void;

  format(contents: Contents): void | Promise<void>;

  count(totalLength: number, pageLength: number): {spreads: Number, pages: Number};

  // Event emitters
  emit(type: any, ...args: any[]): void;

  off(type: any, listener: any): any;

  on(type: any, listener: any): any;

  once(type: any, listener: any, ...args: any[]): any;

  private update(props: object): void;
}
