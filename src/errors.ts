/**
 * Contains error classes.
 */

export class FetchError extends Error {
  status: number;
  statusText: string;

  /** Constructs a FetchError. */
  constructor(status: number, statusText: string) {
    super(`🌩 ${status} Error: ${statusText}`);
    this.status = status;
    this.statusText = statusText;
  }
}
