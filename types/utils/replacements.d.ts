import Section from "../section";
import Contents from "../contents";

export function replaceBase(doc: Document, section: Section): void;

export function replaceCanonical(doc: Document, section: Section): void;

export function replaceMeta(doc: Document, section: Section): void;

export function replaceLinks(contents: Contents, fn: Function): void;

export function substitute(contents: Contents, urls: string[], replacements: string[]): void;
