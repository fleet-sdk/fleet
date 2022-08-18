export class InvalidRegistersPackingError extends Error {
  constructor() {
    super(
      `Registers should be densely packed. This means that it's not possible to use a register like 'R7' without filling 'R6', 'R5' and 'R4', for example.`
    );
  }
}
