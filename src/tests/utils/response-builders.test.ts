import { describe, it, expect } from "vitest";
import {
  buildBankAccountsResponse,
  buildCreditCardsResponse,
  buildCreditCardInvoicesResponse,
  buildInvoiceDetailsResponse,
  buildTransactionsResponse,
  buildTransactionResponse,
  buildBudgetsResponse,
  buildCategoriesResponse,
  buildTransfersResponse,
  buildTransferResponse,
  buildSpendingSummaryResponse,
} from "../../utils/response-builders.js";
import {
  mockBankAccount,
  mockBankAccount2,
  mockCreditCard,
  mockInvoice,
  mockDetailedInvoice,
  mockTransaction,
  mockIncomeTransaction,
  mockInstallmentTransaction,
  mockTransferTransaction,
  mockBudget,
  mockCategory,
  mockIncomeCategory,
  mockCategoryMap,
  mockAccountMap,
} from "../fixtures/index.js";

// Helper to extract all text from content blocks
function getText(result: ReturnType<typeof buildBankAccountsResponse>): string {
  return result.content.map((c) => (c as { text: string }).text).join("\n");
}

describe("buildBankAccountsResponse", () => {
  it("returns summary + table + JSON for array", () => {
    const result = buildBankAccountsResponse([mockBankAccount, mockBankAccount2]);
    expect(result.content).toHaveLength(3);
    const text = getText(result);
    expect(text).toContain("2 bank account");
    expect(text).toContain("Nubank Checking");
  });

  it("returns details view for single account", () => {
    const result = buildBankAccountsResponse(mockBankAccount);
    const text = getText(result);
    expect(text).toContain("Nubank Checking");
    expect(text).toContain("checking");
  });

  it("highlights default account", () => {
    const text = getText(buildBankAccountsResponse([mockBankAccount]));
    expect(text).toContain("Nubank Checking");
  });
});

describe("buildCreditCardsResponse", () => {
  it("returns summary + table + JSON for array", () => {
    const result = buildCreditCardsResponse([mockCreditCard]);
    expect(result.content).toHaveLength(3);
    const text = getText(result);
    expect(text).toContain("Nubank Credit");
    expect(text).toContain("R$");
  });

  it("returns details view for single card", () => {
    const text = getText(buildCreditCardsResponse(mockCreditCard));
    expect(text).toContain("Mastercard");
  });
});

describe("buildCreditCardInvoicesResponse", () => {
  it("returns no-invoices message for empty array", () => {
    const result = buildCreditCardInvoicesResponse([], 1);
    const text = getText(result);
    expect(text).toContain("No invoices");
  });

  it("returns summary + table + JSON for invoices", () => {
    const result = buildCreditCardInvoicesResponse([mockInvoice], 1);
    expect(result.content).toHaveLength(3);
    const text = getText(result);
    expect(text).toContain("invoice");
    expect(text).toContain("R$");
  });
});

describe("buildInvoiceDetailsResponse", () => {
  it("includes statement summary and JSON", () => {
    const text = getText(buildInvoiceDetailsResponse(mockDetailedInvoice));
    expect(text).toContain("Statement Summary");
    expect(text).toContain("R$");
  });

  it("shows paid status when balance is zero", () => {
    const text = getText(buildInvoiceDetailsResponse(mockDetailedInvoice));
    expect(text).toContain("Paid in full");
  });

  it("resolves category names when map is provided", () => {
    const invoice = {
      ...mockDetailedInvoice,
      transactions: [mockTransaction],
    };
    const text = getText(buildInvoiceDetailsResponse(invoice, mockCategoryMap));
    expect(text).toContain("Groceries");
  });

  it("falls back to #id when category map is absent", () => {
    const invoice = {
      ...mockDetailedInvoice,
      transactions: [mockTransaction],
    };
    const text = getText(buildInvoiceDetailsResponse(invoice));
    expect(text).toContain("#10");
  });
});

describe("buildTransactionsResponse", () => {
  it("returns no-transactions message for empty array", () => {
    const text = getText(buildTransactionsResponse([]));
    expect(text).toContain("No transactions found");
  });

  it("includes total income and spending in summary", () => {
    const text = getText(
      buildTransactionsResponse([mockTransaction, mockIncomeTransaction], mockCategoryMap)
    );
    expect(text).toContain("Total income");
    expect(text).toContain("Total spending");
  });

  it("shows Recurring column when recurring transactions exist", () => {
    const text = getText(
      buildTransactionsResponse([mockIncomeTransaction], mockCategoryMap)
    );
    expect(text).toContain("Recurring");
  });

  it("shows Installment column when installment transactions exist", () => {
    const text = getText(
      buildTransactionsResponse([mockInstallmentTransaction])
    );
    expect(text).toContain("Installment");
    expect(text).toContain("3/12");
  });

  it("does not show Recurring column when no recurring transactions", () => {
    const text = getText(buildTransactionsResponse([mockTransaction]));
    expect(text).not.toContain("| Recurring |");
  });

  it("resolves category names", () => {
    const text = getText(
      buildTransactionsResponse([mockTransaction], mockCategoryMap)
    );
    expect(text).toContain("Groceries");
  });

  it("shows truncation note for more than 10 transactions", () => {
    const many = Array.from({ length: 15 }, (_, i) => ({
      ...mockTransaction,
      id: i,
    }));
    const text = getText(buildTransactionsResponse(many));
    expect(text).toContain("Showing 10 of 15");
  });
});

describe("buildTransactionResponse", () => {
  it("includes amount, description, and date", () => {
    const text = getText(buildTransactionResponse(mockTransaction, mockCategoryMap));
    expect(text).toContain("Supermarket");
    expect(text).toContain("R$");
    expect(text).toContain("Groceries");
  });

  it("shows recurring flag", () => {
    const text = getText(buildTransactionResponse(mockIncomeTransaction));
    expect(text).toContain("Recurring");
  });
});

describe("buildBudgetsResponse", () => {
  it("returns no-budgets message for empty array", () => {
    const text = getText(buildBudgetsResponse([]));
    expect(text).toContain("No budgets found");
  });

  it("includes budget summary and table", () => {
    const text = getText(buildBudgetsResponse([mockBudget], "2026", "3", mockCategoryMap));
    expect(text).toContain("Budget Status");
    expect(text).toContain("R$");
    expect(text).toContain("Groceries");
  });

  it("falls back to #id for unknown categories", () => {
    const text = getText(buildBudgetsResponse([mockBudget]));
    expect(text).toContain("#10");
  });
});

describe("buildCategoriesResponse", () => {
  it("returns no-categories message for empty array", () => {
    const text = getText(buildCategoriesResponse([]));
    expect(text).toContain("No categories found");
  });

  it("separates expense and income categories", () => {
    const text = getText(
      buildCategoriesResponse([mockCategory, mockIncomeCategory])
    );
    expect(text).toContain("Expense Categories");
    expect(text).toContain("Income Categories");
  });

  it("returns details for single category", () => {
    const text = getText(buildCategoriesResponse(mockCategory));
    expect(text).toContain("Groceries");
    expect(text).toContain("expenses");
  });
});

describe("buildTransfersResponse", () => {
  it("returns no-transfers message for empty array", () => {
    const text = getText(buildTransfersResponse([]));
    expect(text).toContain("No transfers found");
  });

  it("includes summary with total transferred", () => {
    const text = getText(
      buildTransfersResponse([mockTransferTransaction], mockAccountMap)
    );
    expect(text).toContain("transfer");
    expect(text).toContain("R$");
  });

  it("resolves account names", () => {
    const text = getText(
      buildTransfersResponse([mockTransferTransaction], mockAccountMap)
    );
    expect(text).toContain("Nubank Checking");
    expect(text).toContain("Savings");
  });

  it("falls back to Account #id when map is absent", () => {
    const text = getText(buildTransfersResponse([mockTransferTransaction]));
    expect(text).toContain("Account #");
  });
});

describe("buildTransferResponse", () => {
  it("includes from/to accounts and amount", () => {
    const text = getText(
      buildTransferResponse(mockTransferTransaction, mockAccountMap)
    );
    expect(text).toContain("Nubank Checking");
    expect(text).toContain("Savings");
    expect(text).toContain("R$");
  });
});

describe("buildSpendingSummaryResponse", () => {
  it("returns no-transactions message for empty array", () => {
    const text = getText(
      buildSpendingSummaryResponse({ transactions: [], categoryMap: null })
    );
    expect(text).toContain("No transactions found");
  });

  it("includes total income, expenses, and net", () => {
    const text = getText(
      buildSpendingSummaryResponse({
        transactions: [mockTransaction, mockIncomeTransaction],
        categoryMap: mockCategoryMap,
      })
    );
    expect(text).toContain("Total income");
    expect(text).toContain("Total expenses");
    expect(text).toContain("Net");
  });

  it("groups by category name", () => {
    const text = getText(
      buildSpendingSummaryResponse({
        transactions: [mockTransaction],
        categoryMap: mockCategoryMap,
      })
    );
    expect(text).toContain("Groceries");
  });

  it("shows budget columns when budgetMap is provided", () => {
    const budgetMap = new Map([
      [10, { amount_cents: 50000, category_name: "Groceries" }],
    ]);
    const text = getText(
      buildSpendingSummaryResponse({
        transactions: [mockTransaction],
        categoryMap: mockCategoryMap,
        budgetMap,
      })
    );
    expect(text).toContain("Budget");
    expect(text).toContain("Remaining");
  });
});
