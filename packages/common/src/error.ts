export class FleetError extends Error {
  constructor(message?: string) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype);
    this.name = new.target.name;
  }
}

export class NotSupportedError extends FleetError {
  constructor(message?: string) {
    super(message);
  }
}
