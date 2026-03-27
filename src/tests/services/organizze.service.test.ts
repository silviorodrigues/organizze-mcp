import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { organizzeService } from "../../services/organizze.service.js";
import {
  mockBankAccount,
  mockBankAccount2,
  mockTransaction,
  mockCategory,
  mockBudget,
  mockCreditCard,
  mockInvoice,
} from "../fixtures/index.js";

function mockFetch(data: unknown, ok = true, status = 200) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok,
      status,
      json: () => Promise.resolve(data),
    })
  );
}

describe("OrganizzeService", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("getBankAccounts", () => {
    it("fetches all accounts when no id given", async () => {
      mockFetch([mockBankAccount, mockBankAccount2]);
      const result = await organizzeService.getBankAccounts();
      expect(Array.isArray(result)).toBe(true);
      expect((result as typeof mockBankAccount[]).length).toBe(2);
    });

    it("fetches single account when id given", async () => {
      mockFetch(mockBankAccount);
      const result = await organizzeService.getBankAccounts(1);
      expect((result as typeof mockBankAccount).name).toBe("Nubank Checking");
    });

    it("uses correct URL for single account", async () => {
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockBankAccount),
      });
      vi.stubGlobal("fetch", fetchSpy);

      await organizzeService.getBankAccounts(1);

      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toContain("/accounts/1");
    });

    it("uses correct URL for all accounts", async () => {
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve([mockBankAccount]),
      });
      vi.stubGlobal("fetch", fetchSpy);

      await organizzeService.getBankAccounts();

      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toContain("/accounts");
      expect(url).not.toMatch(/\/accounts\/\d/);
    });

    it("throws on non-ok response", async () => {
      mockFetch(null, false, 401);
      await expect(organizzeService.getBankAccounts()).rejects.toThrow("401");
    });

    it("includes Authorization header", async () => {
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve([mockBankAccount]),
      });
      vi.stubGlobal("fetch", fetchSpy);

      await organizzeService.getBankAccounts();

      const options = fetchSpy.mock.calls[0][1] as RequestInit;
      expect((options.headers as Record<string, string>).Authorization).toMatch(
        /^Basic /
      );
    });
  });

  describe("getTransactions", () => {
    it("fetches transactions without params", async () => {
      mockFetch([mockTransaction]);
      const result = await organizzeService.getTransactions();
      expect(result).toHaveLength(1);
    });

    it("appends date_range to URL", async () => {
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve([mockTransaction]),
      });
      vi.stubGlobal("fetch", fetchSpy);

      await organizzeService.getTransactions({
        date_range: { start_date: "2026-03-01", end_date: "2026-03-31" },
      });

      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toContain("start_date=2026-03-01");
      expect(url).toContain("end_date=2026-03-31");
    });

    it("filters recurring transactions client-side", async () => {
      const nonRecurring = { ...mockTransaction, recurring: false };
      const recurring = { ...mockTransaction, id: 999, recurring: true };
      mockFetch([nonRecurring, recurring]);

      const result = await organizzeService.getTransactions({
        recurring_only: true,
        date_range: { start_date: "2026-03-01", end_date: "2026-03-31" },
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(999);
    });
  });

  describe("getTransaction", () => {
    it("fetches single transaction by id", async () => {
      mockFetch(mockTransaction);
      const result = await organizzeService.getTransaction(100);
      expect(result.id).toBe(100);
    });

    it("uses correct URL", async () => {
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockTransaction),
      });
      vi.stubGlobal("fetch", fetchSpy);

      await organizzeService.getTransaction(100);

      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toContain("/transactions/100");
    });
  });

  describe("createTransaction", () => {
    const payload = {
      description: "Lunch",
      date: "2026-03-26",
      amount_cents: -5000,
      category_id: 10,
      account_id: 1,
    };

    it("POSTs to /transactions", async () => {
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ ...mockTransaction, ...payload }),
      });
      vi.stubGlobal("fetch", fetchSpy);

      await organizzeService.createTransaction(payload);

      const options = fetchSpy.mock.calls[0][1] as RequestInit;
      expect(options.method).toBe("POST");
      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toContain("/transactions");
    });

    it("sends Content-Type: application/json", async () => {
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockTransaction),
      });
      vi.stubGlobal("fetch", fetchSpy);

      await organizzeService.createTransaction(payload);

      const options = fetchSpy.mock.calls[0][1] as RequestInit;
      expect(
        (options.headers as Record<string, string>)["Content-Type"]
      ).toBe("application/json");
    });

    it("throws on non-ok response", async () => {
      mockFetch(null, false, 422);
      await expect(organizzeService.createTransaction(payload)).rejects.toThrow(
        "422"
      );
    });
  });

  describe("getCategories", () => {
    it("fetches all categories", async () => {
      mockFetch([mockCategory]);
      const result = await organizzeService.getCategories();
      expect(Array.isArray(result)).toBe(true);
    });

    it("fetches single category by id", async () => {
      mockFetch(mockCategory);
      const result = await organizzeService.getCategories(10);
      expect((result as typeof mockCategory).name).toBe("Groceries");
    });

    it("uses /categories/:id URL for single fetch", async () => {
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockCategory),
      });
      vi.stubGlobal("fetch", fetchSpy);

      await organizzeService.getCategories(10);

      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toContain("/categories/10");
    });
  });

  describe("getBudgets", () => {
    it("fetches budgets without year/month", async () => {
      mockFetch([mockBudget]);
      const result = await organizzeService.getBudgets();
      expect(result).toHaveLength(1);
    });

    it("appends year and month to URL", async () => {
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve([mockBudget]),
      });
      vi.stubGlobal("fetch", fetchSpy);

      await organizzeService.getBudgets("2026", "3");

      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toContain("/budgets/2026/3");
    });
  });

  describe("getCreditCards", () => {
    it("fetches all credit cards", async () => {
      mockFetch([mockCreditCard]);
      const result = await organizzeService.getCreditCards();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getCreditCardInvoices", () => {
    it("fetches invoices for a card", async () => {
      mockFetch([mockInvoice]);
      const result = await organizzeService.getCreditCardInvoices(1);
      expect(result).toHaveLength(1);
    });

    it("appends date range when provided", async () => {
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve([mockInvoice]),
      });
      vi.stubGlobal("fetch", fetchSpy);

      await organizzeService.getCreditCardInvoices(1, {
        start_date: "2026-01-01",
        end_date: "2026-03-31",
      });

      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toContain("start_date=2026-01-01");
    });
  });

  describe("getTransfers", () => {
    it("fetches all transfers", async () => {
      mockFetch([mockTransaction]);
      const result = await organizzeService.getTransfers();
      expect(result).toHaveLength(1);
    });

    it("appends date range when provided", async () => {
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve([mockTransaction]),
      });
      vi.stubGlobal("fetch", fetchSpy);

      await organizzeService.getTransfers({
        start_date: "2026-03-01",
        end_date: "2026-03-31",
      });

      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toContain("start_date=2026-03-01");
    });
  });

  describe("getCategoryMap", () => {
    it("returns a Map of id to name", async () => {
      mockFetch([mockCategory]);
      const map = await organizzeService.getCategoryMap();
      expect(map?.get(10)).toBe("Groceries");
    });
  });

  describe("getAccountMap", () => {
    it("returns a Map of id to name", async () => {
      mockFetch([mockBankAccount, mockBankAccount2]);
      const map = await organizzeService.getAccountMap();
      expect(map?.get(1)).toBe("Nubank Checking");
      expect(map?.get(2)).toBe("Savings");
    });
  });
});
