// Barrel file — re-exports all response builders from domain modules.
// Import from specific builder files for tree-shaking, or use this file
// for convenience when you need multiple builders.

export { buildBankAccountsResponse } from "./builders/accounts.js";
export { buildCreditCardsResponse } from "./builders/credit-cards.js";
export {
  buildCreditCardInvoicesResponse,
  buildInvoiceDetailsResponse,
} from "./builders/invoices.js";
export {
  buildTransactionsResponse,
  buildTransactionResponse,
} from "./builders/transactions.js";
export { buildBudgetsResponse } from "./builders/budgets.js";
export { buildCategoriesResponse } from "./builders/categories.js";
export {
  buildTransfersResponse,
  buildTransferResponse,
} from "./builders/transfers.js";
export {
  buildSpendingSummaryResponse,
  type BudgetEntry,
} from "./builders/spending.js";
