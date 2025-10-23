const MIN_CACHE_MS = 2 * 60 * 1000;
const MAX_CACHE_MS = 10 * 60 * 1000;

const clampDuration = (ms) => Math.min(Math.max(ms, MIN_CACHE_MS), MAX_CACHE_MS);

export class FirebaseTokenManager {
  constructor(auth, options = {}) {
    this.auth = auth;
    const initialMinutes = options.cacheDurationMinutes ?? 5;
    this.cacheDurationMs = clampDuration(initialMinutes * 60 * 1000);
    this.cachedToken = null;
    this.fetchedAt = 0;
    this.inFlightPromise = null;
  }

  setCacheDurationMinutes(minutes) {
    this.cacheDurationMs = clampDuration(minutes * 60 * 1000);
    this.clear();
  }

  clear() {
    this.cachedToken = null;
    this.fetchedAt = 0;
  }

  async getToken({ forceRefresh = false } = {}) {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user available for token retrieval');
    }

    const now = Date.now();
    const isExpired = !this.cachedToken || now - this.fetchedAt >= this.cacheDurationMs;

    if (!forceRefresh && this.cachedToken && !isExpired) {
      return this.cachedToken;
    }

    if (!this.inFlightPromise) {
      const shouldForce = forceRefresh || isExpired;
      this.inFlightPromise = user.getIdToken(shouldForce).then((token) => {
        this.cachedToken = token;
        this.fetchedAt = Date.now();
        return token;
      }).finally(() => {
        this.inFlightPromise = null;
      });
    }

    return this.inFlightPromise;
  }
}
