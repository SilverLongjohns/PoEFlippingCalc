/**
 * Reads GGG's X-Rate-Limit-* headers to manage request pacing.
 *
 * Header format: "maxHits:period:penaltyTimeout"
 * State format:  "currentHits:period:penaltyTimeRemaining"
 */
export class RateLimiter {
  private maxHits: number = Infinity;
  private period: number = 1;
  private penaltyTimeout: number = 0;
  private currentHits: number = 0;
  private penaltyTimeRemaining: number = 0;

  updateFromHeaders(headers: Headers): void {
    const limitHeader = headers.get('X-Rate-Limit-Ip') || headers.get('x-rate-limit-ip');
    const stateHeader = headers.get('X-Rate-Limit-Ip-State') || headers.get('x-rate-limit-ip-state');

    if (limitHeader) {
      const [maxHits, period, penaltyTimeout] = limitHeader.split(':').map(Number);
      this.maxHits = maxHits;
      this.period = period;
      this.penaltyTimeout = penaltyTimeout;
    }

    if (stateHeader) {
      const [currentHits, , penaltyTimeRemaining] = stateHeader.split(':').map(Number);
      this.currentHits = currentHits;
      this.penaltyTimeRemaining = penaltyTimeRemaining;
    }
  }

  canMakeRequest(): boolean {
    if (this.penaltyTimeRemaining > 0) return false;
    return this.currentHits < this.maxHits;
  }

  getDelayMs(): number {
    if (this.penaltyTimeRemaining > 0) {
      return this.penaltyTimeRemaining * 1000;
    }
    if (this.currentHits >= this.maxHits) {
      return this.period * 1000;
    }
    return 0;
  }
}
