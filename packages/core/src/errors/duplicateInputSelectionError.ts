export class DuplicateInputSelectionError extends Error {
  constructor() {
    super(`One or more inputs was selected more than one time by the current selection strategy.`);
  }
}
