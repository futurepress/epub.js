import Spine from "./spine";
import Section from "./section";
import EpubCFI from "./epubcfi";

export default class Locations {
  constructor(spine: Spine, request?: Function, pause?: number);

  generate(chars: number): Promise<Array<string>>;

  process(section: Section): Promise<Array<string>>;

  locationFromCfi(cfi: string | EpubCFI): Location;

  percentageFromCfi(cfi: string | EpubCFI): number;

  percentageFromLocation(loc: number): number;

  cfiFromLocation(loc: number): string;

  cfiFromPercentage(percentage: number): string;

  load(locations: string): Array<string>;

  save(): string;

  currentLocation(): Location;
  currentLocation(curr: string | number): void;

  length(): number;

  destroy(): void;

  private createRange(): {
    startContainer: Element,
    startOffset: number,
    endContainer: Element,
    endOffset: number
  };

  private parse(contents: Node, cfiBase: string, chars: number) : Array<string>;
}
