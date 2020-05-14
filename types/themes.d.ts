import Rendition from "./rendition";
import Contents from "./contents";

export default class Themes {
  constructor(rendition: Rendition);

  register( themeObject: object ): void;

  register( theme: string, url: string ): void;

  register( theme: string, themeObject: object ): void;

  default( theme: object | string ): void;

  registerThemes( themes: object ): void;

  registerCss( name: string, css: string ): void;

  registerUrl( name: string, input: string ): void;

  registerRules( name: string, rules: object ): void;

  select( name: string ): void;

  update( name: string ): void;

  inject( content: Contents ): void;

  add( name: string, contents: Contents ): void;

  override(name: string, value: string, priority?: boolean): void;

  overrides(contents: Contents): void;

  fontSize(size: string): void;

  font(f: string): void;

  destroy(): void;
}
