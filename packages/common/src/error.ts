export class FleetError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);

    Object.setPrototypeOf(this, new.target.prototype);
    this.name = new.target.name;
  }
}

export class NotSupportedError extends FleetError {
  constructor(message?: string) {
    super(message);
  }
}

export class BlockchainProviderError extends FleetError {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
  }
}
