import type {
  BankAccount,
  Budget,
  Category,
  CreditCard,
  CreditCardInvoice,
  DetailedInvoice,
  Transaction,
} from "../../models/organizze.models.js";

export const mockBankAccount: BankAccount = {
  id: 1,
  name: "Nubank Checking",
  description: "Main checking account",
  archived: false,
  created_at: "2024-01-15T10:00:00Z",
  updated_at: "2024-01-15T10:00:00Z",
  default: true,
  type: "checking",
};

export const mockBankAccount2: BankAccount = {
  id: 2,
  name: "Savings",
  description: "",
  archived: false,
  created_at: "2024-02-01T10:00:00Z",
  updated_at: "2024-02-01T10:00:00Z",
  default: false,
  type: "savings",
};

export const mockCategory: Category = {
  id: 10,
  name: "Groceries",
  color: "#FF5733",
  parent_id: 0,
  group_id: "",
  fixed: false,
  essential: true,
  default: false,
  uuid: "abc-123",
  kind: "expenses",
  archived: false,
};

export const mockIncomeCategory: Category = {
  id: 20,
  name: "Salary",
  color: "#33FF57",
  parent_id: 0,
  group_id: "",
  fixed: false,
  essential: false,
  default: true,
  uuid: "def-456",
  kind: "earnings",
  archived: false,
};

export const mockTransaction: Transaction = {
  id: 100,
  description: "Supermarket",
  date: "2026-03-15",
  paid: true,
  amount_cents: -8500,
  total_installments: 1,
  installment: 1,
  recurring: false,
  account_id: 1,
  category_id: 10,
  notes: null,
  attachments_count: 0,
  credit_card_id: null,
  credit_card_invoice_id: null,
  paid_credit_card_id: null,
  paid_credit_card_invoice_id: null,
  oposite_transaction_id: null,
  oposite_account_id: null,
  recurrence_id: null,
  created_at: "2026-03-15T12:00:00Z",
  updated_at: "2026-03-15T12:00:00Z",
  tags: [],
  attachments: [],
};

export const mockIncomeTransaction: Transaction = {
  ...mockTransaction,
  id: 101,
  description: "Salary",
  amount_cents: 500000,
  category_id: 20,
  recurring: true,
};

export const mockInstallmentTransaction: Transaction = {
  ...mockTransaction,
  id: 102,
  description: "TV Purchase",
  amount_cents: -20000,
  total_installments: 12,
  installment: 3,
};

export const mockTransferTransaction: Transaction = {
  ...mockTransaction,
  id: 103,
  description: "Transfer to Savings",
  amount_cents: -100000,
  oposite_transaction_id: 104,
  oposite_account_id: 2,
};

export const mockCreditCard: CreditCard = {
  id: 1,
  name: "Nubank Credit",
  description: "Main credit card",
  card_network: "Mastercard",
  closing_day: 3,
  due_day: 10,
  limit_cents: 500000,
  archived: false,
  default: true,
  institution_id: "1",
  institution_name: "Nubank",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  type: "credit_card",
};

export const mockInvoice: CreditCardInvoice = {
  id: 1,
  date: "2026-03-10",
  starting_date: "2026-02-04",
  closing_date: "2026-03-03",
  amount_cents: 45000,
  payment_amount_cents: 45000,
  balance_cents: 0,
  previous_balance_cents: 0,
  credit_card_id: 1,
};

export const mockDetailedInvoice: DetailedInvoice = {
  ...mockInvoice,
  transactions: [mockTransaction],
  payments: [],
};

export const mockBudget: Budget = {
  id: 1,
  amount_in_cents: 50000,
  category_id: 10,
  date: "2026-03-01",
  activity_type: 2,
  total: 8500,
  predicted_total: 8500,
  percentage: "17%",
};

export const mockCategoryMap = new Map<number, string>([
  [10, "Groceries"],
  [20, "Salary"],
]);

export const mockAccountMap = new Map<number, string>([
  [1, "Nubank Checking"],
  [2, "Savings"],
]);
