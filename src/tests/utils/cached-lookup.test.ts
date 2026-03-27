import { describe, it, expect, vi, beforeEach } from "vitest";
import { CachedLookup } from "../../utils/cached-lookup.js";

describe("CachedLookup", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it("calls fetcher on first get()", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Map([[1, "Groceries"]]));
    const lookup = new CachedLookup(fetcher);

    await lookup.get();
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it("returns cached value on second get() within TTL", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Map([[1, "Groceries"]]));
    const lookup = new CachedLookup(fetcher);

    await lookup.get();
    await lookup.get();
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it("re-fetches after TTL expires", async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn().mockResolvedValue(new Map([[1, "Groceries"]]));
    const ttl = 1000;
    const lookup = new CachedLookup(fetcher, ttl);

    await lookup.get();
    vi.advanceTimersByTime(ttl + 1);
    await lookup.get();

    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("returns stale cache when fetcher throws", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Map([[1, "Groceries"]]))
      .mockRejectedValueOnce(new Error("network error"));

    const lookup = new CachedLookup(fetcher, 1);
    vi.useFakeTimers();

    const first = await lookup.get();
    expect(first?.get(1)).toBe("Groceries");

    vi.advanceTimersByTime(2);
    const second = await lookup.get();
    // Should return stale cache rather than null
    expect(second?.get(1)).toBe("Groceries");
  });

  it("returns null when fetcher throws on first call", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("network error"));
    const lookup = new CachedLookup(fetcher);

    const result = await lookup.get();
    expect(result).toBeNull();
  });

  it("resolve() returns the mapped value", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Map([[10, "Groceries"]]));
    const lookup = new CachedLookup<number, string>(fetcher);

    await lookup.get();
    expect(lookup.resolve(10, "#10")).toBe("Groceries");
  });

  it("resolve() returns fallback when key is missing", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Map([[10, "Groceries"]]));
    const lookup = new CachedLookup<number, string>(fetcher);

    await lookup.get();
    expect(lookup.resolve(99, "#99")).toBe("#99");
  });

  it("resolve() returns fallback when cache is empty (before first get)", () => {
    const fetcher = vi.fn().mockResolvedValue(new Map());
    const lookup = new CachedLookup<number, string>(fetcher);

    expect(lookup.resolve(1, "#1")).toBe("#1");
  });
});
