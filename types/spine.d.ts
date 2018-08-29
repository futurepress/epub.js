import Packaging from "./packaging";
import Section from "./section";
import Hook from "./utils/hook";

export default class Spine {
  constructor();

  hooks: {
    serialize: Hook,
    content: Hook
  };

  unpack(_package: Packaging, resolver: Function, canonical: Function): void;

  get(target?: string | number): Section;

  each(...args: any[]): any;

  first(): Section;

  last(): Section;

  destroy(): void;

  private append(section: Section): number;

  private prepend(section: Section): number;

  private remove(section: Section): number;
}
