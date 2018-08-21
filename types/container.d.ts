export default class Container {
  constructor(containerDocument: Document);

  parse(containerDocument: Document): void;

  destroy(): void;
}
