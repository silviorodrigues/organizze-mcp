const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

export class CachedLookup<K, V> {
  private cache: Map<K, V> | null = null;
  private fetchedAt = 0;
  private readonly ttlMs: number;
  private readonly fetcher: () => Promise<Map<K, V>>;

  constructor(fetcher: () => Promise<Map<K, V>>, ttlMs = DEFAULT_TTL_MS) {
    this.fetcher = fetcher;
    this.ttlMs = ttlMs;
  }

  async get(): Promise<Map<K, V> | null> {
    if (this.cache && Date.now() - this.fetchedAt < this.ttlMs) {
      return this.cache;
    }

    try {
      this.cache = await this.fetcher();
      this.fetchedAt = Date.now();
      return this.cache;
    } catch {
      return this.cache;
    }
  }

  resolve(key: K, fallback: string): string {
    return this.cache?.get(key) as string ?? fallback;
  }
}
