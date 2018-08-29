import Book, { BookOptions } from "./book";

export default Epub;

declare function Epub(url: string, options?: BookOptions) : Book;
declare function Epub(options?: BookOptions) : Book;
