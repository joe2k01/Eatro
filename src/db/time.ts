export class UnixSeconds {
  public readonly seconds: number;

  constructor(seconds: number) {
    this.seconds = Math.floor(seconds);
  }

  static now(): UnixSeconds {
    return new UnixSeconds(Date.now() / 1000);
  }

  static fromSeconds(seconds: number): UnixSeconds {
    return new UnixSeconds(seconds);
  }

  dayStartUtc(): UnixSeconds {
    const d = new Date(this.seconds * 1000);
    return new UnixSeconds(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 1000,
    );
  }
}
