// Type definitions for epubjs 0.3
// Project: https://github.com/futurepress/epub.js#readme
// Definitions by: Fred Chasen <https://github.com/fchasen>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
import Epub from "./epub";

export as namespace ePub;

export default Epub;

export { default as Book } from './book';
export { default as EpubCFI } from './epubcfi';
export { default as Rendition } from './rendition';
export { default as Contents } from './contents';
export { default as Layout } from './layout';

declare namespace ePub {

}
