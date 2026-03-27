import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import {
  BankAccount,
  Budget,
  Category,
  CreditCard,
  CreditCardInvoice,
  DetailedInvoice,
  Transaction,
} from "../models/organizze.models.js";
import {
  formatCurrency,
  formatDate,
  formatShortDate,
  calculatePercentage,
  createMarkdownTable,
  groupByCategory,
} from "./formatters.js";

const JSON_CAP = 50;

function buildCappedJson(data: unknown): string {
  if (Array.isArray(data) && data.length > JSON_CAP) {
    const capped = data.slice(0, JSON_CAP);
    return (
      "```json\n" +
      JSON.stringify(capped, null, 2) +
      "\n```\n" +
      `_Showing ${JSON_CAP} of ${data.length} items in JSON. Use date_range to narrow results._`
    );
  }
  return "```json\n" + JSON.stringify(data, null, 2) + "\n```";
}

function resolveCategoryName(
  categoryId: number,
  categoryMap?: Map<number, string> | null
): string {
  if (!categoryMap) return `#${categoryId}`;
  return categoryMap.get(categoryId) ?? `#${categoryId}`;
}

/**
 * Build response for bank accounts
 */
export function buildBankAccountsResponse(
  accounts: BankAccount[] | BankAccount
): CallToolResult {
  // Handle single account case
  if (!Array.isArray(accounts)) {
    return buildSingleBankAccountResponse(accounts);
  }

  // Note: The BankAccount model doesn't have a balance property
  // We'll just focus on the account information

  // Find default account
  const defaultAccount = accounts.find((account) => account.default);

  // Create summary text
  const summary = `You have ${accounts.length} bank account${
    accounts.length !== 1 ? "s" : ""
  }.${
    defaultAccount
      ? ` Your primary ${defaultAccount.type} account is "${defaultAccount.name}".`
      : ""
  }`;

  // Create markdown table
  const table = createMarkdownTable<BankAccount>(
    ["Account Name", "Type", "Default", "Created"],
    ["left", "left", "center", "right"],
    accounts,
    (account) => [
      account.name,
      account.type,
      account.default ? "✓" : "",
      formatShortDate(account.created_at),
    ]
  );

  // Return formatted response
  return {
    content: [
      { type: "text", text: summary },
      { type: "text", text: table },
      { type: "text", text: buildCappedJson(accounts) },
    ],
  };
}

/**
 * Build response for a single bank account
 */
function buildSingleBankAccountResponse(account: BankAccount): CallToolResult {
  // Create summary text
  const summary = `Your ${account.name} ${account.type} account${
    account.default ? " is your default account" : ""
  }.`;

  // Create markdown details
  const details = [
    "## Account Details",
    `**Name:** ${account.name}`,
    `**Type:** ${account.type}`,
    `**Default:** ${account.default ? "Yes" : "No"}`,
    `**Created:** ${formatDate(account.created_at)}`,
    `**Last Updated:** ${formatDate(account.updated_at)}`,
  ].join("\n");

  // Return formatted response
  return {
    content: [
      { type: "text", text: summary },
      { type: "text", text: details },
      {
        type: "text",
        text: "```json\n" + JSON.stringify(account, null, 2) + "\n```",
      },
    ],
  };
}

/**
 * Build response for credit cards
 */
export function buildCreditCardsResponse(
  cards: CreditCard[] | CreditCard
): CallToolResult {
  // Handle single card case
  if (!Array.isArray(cards)) {
    return buildSingleCreditCardResponse(cards);
  }

  // Create summary text
  const summary = `You have ${cards.length} credit card${
    cards.length !== 1 ? "s" : ""
  }.${
    cards.length > 0
      ? ` Your ${
          cards.find((card) => card.default)?.name || cards[0].name
        } card has a limit of ${formatCurrency(
          cards.find((card) => card.default)?.limit_cents ||
            cards[0].limit_cents
        )}.`
      : ""
  }`;

  // Create markdown table
  const table = createMarkdownTable<CreditCard>(
    ["Card Name", "Network", "Limit", "Closing Day", "Due Day", "Default"],
    ["left", "left", "right", "center", "center", "center"],
    cards,
    (card) => [
      card.name,
      card.card_network,
      formatCurrency(card.limit_cents),
      card.closing_day.toString(),
      card.due_day.toString(),
      card.default ? "✓" : "",
    ]
  );

  // Return formatted response
  return {
    content: [
      { type: "text", text: summary },
      { type: "text", text: table },
      { type: "text", text: buildCappedJson(cards) },
    ],
  };
}

/**
 * Build response for a single credit card
 */
function buildSingleCreditCardResponse(card: CreditCard): CallToolResult {
  // Create summary text
  const summary = `Your ${card.name} ${
    card.card_network
  } card has a limit of ${formatCurrency(card.limit_cents)} and ${
    card.default ? "is your default card" : "is not your default card"
  }.`;

  // Create markdown details
  const details = [
    "## Credit Card Details",
    `**Name:** ${card.name}`,
    `**Network:** ${card.card_network}`,
    `**Limit:** ${formatCurrency(card.limit_cents)}`,
    `**Closing Day:** ${card.closing_day}`,
    `**Due Day:** ${card.due_day}`,
    `**Default:** ${card.default ? "Yes" : "No"}`,
    `**Created:** ${formatDate(card.created_at)}`,
    `**Last Updated:** ${formatDate(card.updated_at)}`,
  ].join("\n");

  // Return formatted response
  return {
    content: [
      { type: "text", text: summary },
      { type: "text", text: details },
      {
        type: "text",
        text: "```json\n" + JSON.stringify(card, null, 2) + "\n```",
      },
    ],
  };
}

/**
 * Build response for credit card invoices
 */
export function buildCreditCardInvoicesResponse(
  invoices: CreditCardInvoice[],
  creditCardId: number
): CallToolResult {
  if (!invoices || invoices.length === 0) {
    return {
      content: [
        { type: "text", text: "No invoices found for this credit card." },
      ],
    };
  }

  // Sort invoices by date (newest first)
  const sortedInvoices = [...invoices].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get most recent invoice
  const mostRecent = sortedInvoices[0];

  // Create summary text
  const summary =
    `You have ${invoices.length} invoice${
      invoices.length !== 1 ? "s" : ""
    } for this credit card. ` +
    `The most recent invoice is for ${formatDate(
      mostRecent.date
    )} with a balance of ${formatCurrency(mostRecent.amount_cents)}.`;

  // Create markdown table
  const table = createMarkdownTable<CreditCardInvoice>(
    ["Date", "Starting Date", "Closing Date", "Amount", "Payment", "Balance"],
    ["center", "center", "center", "right", "right", "right"],
    sortedInvoices,
    (invoice) => [
      formatShortDate(invoice.date),
      formatShortDate(invoice.starting_date),
      formatShortDate(invoice.closing_date),
      formatCurrency(invoice.amount_cents),
      formatCurrency(invoice.payment_amount_cents),
      formatCurrency(invoice.balance_cents),
    ]
  );

  // Return formatted response
  return {
    content: [
      { type: "text", text: summary },
      { type: "text", text: table },
      { type: "text", text: buildCappedJson(invoices) },
    ],
  };
}

/**
 * Build response for invoice details
 */
export function buildInvoiceDetailsResponse(
  invoice: DetailedInvoice,
  categoryMap?: Map<number, string> | null,
  payments?: Transaction[] | null
): CallToolResult {
  if (!invoice) {
    return {
      content: [{ type: "text", text: "No invoice details found." }],
    };
  }

  // Find largest transaction
  let largestTransaction = { amount_cents: 0, description: "" };
  if (invoice.transactions && invoice.transactions.length > 0) {
    largestTransaction = invoice.transactions.reduce(
      (max, transaction) =>
        transaction.amount_cents > max.amount_cents ? transaction : max,
      { amount_cents: 0, description: "" } as Transaction
    );
  }

  // Create summary text
  const summary =
    `This invoice has a balance of ${formatCurrency(
      invoice.balance_cents
    )} for the period from ` +
    `${formatDate(invoice.starting_date)} to ${formatDate(
      invoice.closing_date
    )}.` +
    (invoice.transactions.length > 0
      ? ` It includes ${invoice.transactions.length} transactions, ` +
        `with the largest being ${formatCurrency(
          largestTransaction.amount_cents
        )} at '${largestTransaction.description}'.`
      : "");

  // Derive payment status
  let paymentStatus: string;
  if (invoice.balance_cents === 0) {
    paymentStatus = "Paid in full";
  } else if (invoice.payment_amount_cents > 0) {
    paymentStatus = "Partially paid";
  } else {
    paymentStatus = "Unpaid";
  }

  // Create statement summary
  const statementSummary = [
    "## Statement Summary",
    `**Period:** ${formatDate(invoice.starting_date)} - ${formatDate(
      invoice.closing_date
    )}`,
    `**Total:** ${formatCurrency(invoice.amount_cents)}`,
    `**Payment:** ${formatCurrency(invoice.payment_amount_cents)}`,
    `**Balance:** ${formatCurrency(invoice.balance_cents)}`,
    `**Previous Balance:** ${formatCurrency(invoice.previous_balance_cents)}`,
    `**Status:** ${paymentStatus}`,
  ].join("\n");

  // Create transactions table if there are transactions
  let transactionsTable = "";
  if (invoice.transactions && invoice.transactions.length > 0) {
    transactionsTable =
      "## Transactions\n" +
      createMarkdownTable<Transaction>(
        ["Date", "Description", "Amount", "Category"],
        ["center", "left", "right", "left"],
        invoice.transactions,
        (transaction) => [
          formatShortDate(transaction.date),
          transaction.description,
          formatCurrency(transaction.amount_cents),
          resolveCategoryName(transaction.category_id, categoryMap),
        ]
      );
  }

  // Use payments from param or fall back to inline invoice.payments
  const allPayments = (payments && payments.length > 0)
    ? payments
    : (invoice.payments && invoice.payments.length > 0)
      ? invoice.payments
      : null;

  let paymentsTable = "";
  if (allPayments && allPayments.length > 0) {
    paymentsTable =
      "## Payments\n" +
      createMarkdownTable<Transaction>(
        ["Date", "Description", "Amount", "Paid"],
        ["center", "left", "right", "center"],
        allPayments,
        (payment) => [
          formatShortDate(payment.date),
          payment.description || "Payment",
          formatCurrency(Math.abs(payment.amount_cents)),
          payment.paid ? "✓" : "✗",
        ]
      );
  }

  const content: CallToolResult["content"] = [
    { type: "text", text: summary },
    { type: "text", text: statementSummary },
  ];

  if (transactionsTable) {
    content.push({ type: "text", text: transactionsTable });
  }

  if (paymentsTable) {
    content.push({ type: "text", text: paymentsTable });
  }

  content.push({ type: "text", text: buildCappedJson(invoice) });

  return { content };
}

/**
 * Build response for transactions
 */
export function buildTransactionsResponse(
  transactions: Transaction[],
  categoryMap?: Map<number, string> | null
): CallToolResult {
  if (!transactions || transactions.length === 0) {
    return {
      content: [{ type: "text", text: "No transactions found." }],
    };
  }

  // Calculate totals
  const expenses = transactions.filter((t) => t.amount_cents < 0);
  const income = transactions.filter((t) => t.amount_cents > 0);
  const totalSpending = Math.abs(
    expenses.reduce((sum, t) => sum + t.amount_cents, 0)
  );
  const totalIncome = income.reduce((sum, t) => sum + t.amount_cents, 0);

  // Find largest expense
  const largestExpense = expenses.length > 0
    ? expenses.reduce(
        (max, transaction) =>
          Math.abs(transaction.amount_cents) > Math.abs(max.amount_cents)
            ? transaction
            : max,
        { amount_cents: 0, description: "" } as Transaction
      )
    : null;

  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Create date range text
  const startDate = formatDate(
    sortedTransactions[sortedTransactions.length - 1].date
  );
  const endDate = formatDate(sortedTransactions[0].date);
  const dateRangeText =
    startDate === endDate ? startDate : `${startDate} to ${endDate}`;

  // Check if we need recurring/installment columns
  const hasRecurring = transactions.some((t) => t.recurring);
  const hasInstallments = transactions.some((t) => t.total_installments > 1);

  // Create summary text
  let summary =
    `Found ${transactions.length} transaction${
      transactions.length !== 1 ? "s" : ""
    } from ${dateRangeText}.`;

  if (totalIncome > 0) {
    summary += ` Total income: ${formatCurrency(totalIncome)}.`;
  }
  if (expenses.length > 0) {
    summary += ` Total spending: ${formatCurrency(totalSpending)}.`;
  }
  if (largestExpense && largestExpense.amount_cents !== 0) {
    summary += ` Largest expense: ${formatCurrency(
      Math.abs(largestExpense.amount_cents)
    )} at '${largestExpense.description}'.`;
  }

  // Build dynamic headers and row data
  const headers = ["Date", "Description", "Amount", "Paid", "Category"];
  const alignments: ("center" | "left" | "right")[] = ["center", "left", "right", "center", "left"];

  if (hasRecurring) {
    headers.push("Recurring");
    alignments.push("center");
  }
  if (hasInstallments) {
    headers.push("Installment");
    alignments.push("center");
  }

  const table = createMarkdownTable<Transaction>(
    headers,
    alignments,
    sortedTransactions.slice(0, 10),
    (transaction) => {
      const row = [
        formatShortDate(transaction.date),
        transaction.description,
        formatCurrency(transaction.amount_cents),
        transaction.paid ? "✓" : "✗",
        resolveCategoryName(transaction.category_id, categoryMap),
      ];

      if (hasRecurring) {
        row.push(transaction.recurring ? "✓" : "");
      }
      if (hasInstallments) {
        row.push(
          transaction.total_installments > 1
            ? `${transaction.installment}/${transaction.total_installments}`
            : ""
        );
      }

      return row;
    }
  );

  const note =
    transactions.length > 10
      ? `\n_Showing 10 of ${transactions.length} transactions._`
      : "";

  return {
    content: [
      { type: "text", text: summary },
      { type: "text", text: table + note },
      { type: "text", text: buildCappedJson(transactions) },
    ],
  };
}

/**
 * Build response for a single transaction
 */
export function buildTransactionResponse(
  transaction: Transaction,
  categoryMap?: Map<number, string> | null
): CallToolResult {
  if (!transaction) {
    return {
      content: [{ type: "text", text: "No transaction found." }],
    };
  }

  // Create summary text
  const summary =
    `Transaction of ${formatCurrency(transaction.amount_cents)} for '${
      transaction.description
    }' on ${formatDate(transaction.date)}.` +
    ` Status: ${transaction.paid ? "Paid" : "Not paid"}.`;

  // Create markdown details
  const details = [
    "## Transaction Details",
    `**Description:** ${transaction.description}`,
    `**Date:** ${formatDate(transaction.date)}`,
    `**Amount:** ${formatCurrency(transaction.amount_cents)}`,
    `**Category:** ${resolveCategoryName(transaction.category_id, categoryMap)}`,
    `**Account ID:** ${transaction.account_id}`,
    `**Status:** ${transaction.paid ? "Paid" : "Not paid"}`,
    `**Recurring:** ${transaction.recurring ? "Yes" : "No"}`,
    ...(transaction.notes ? [`**Notes:** ${transaction.notes}`] : []),
    ...(transaction.tags && transaction.tags.length > 0
      ? [`**Tags:** ${transaction.tags.join(", ")}`]
      : []),
  ].join("\n");

  // Return formatted response
  return {
    content: [
      { type: "text", text: summary },
      { type: "text", text: details },
      {
        type: "text",
        text: "```json\n" + JSON.stringify(transaction, null, 2) + "\n```",
      },
    ],
  };
}

/**
 * Build response for budgets
 */
export function buildBudgetsResponse(
  budgets: Budget[],
  year?: string,
  month?: string,
  categoryMap?: Map<number, string> | null
): CallToolResult {
  if (!budgets || budgets.length === 0) {
    return {
      content: [
        {
          type: "text",
          text: `No budgets found${
            year ? ` for ${year}${month ? `-${month}` : ""}` : ""
          }.`,
        },
      ],
    };
  }

  // Calculate budget status
  const underBudget = budgets.filter((b) => b.total <= b.amount_in_cents);
  const overBudget = budgets.filter((b) => b.total > b.amount_in_cents);

  // Calculate overall budget usage
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount_in_cents, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.total, 0);
  const overallPercentage = calculatePercentage(
    totalSpent,
    totalBudget
  ).replace("%", "");

  // Create summary text
  const periodText = year ? ` for ${month ? `${month}/${year}` : year}` : "";
  const summary =
    `You have ${budgets.length} budget categories${periodText}. ` +
    `You're under budget in ${underBudget.length} categories and over budget in ${overBudget.length} categories. ` +
    `Overall, you've spent ${overallPercentage}% of your total monthly budget.`;

  // Create budget table
  const table = createMarkdownTable<Budget>(
    ["Category", "Budget", "Spent", "Remaining", "% Used"],
    ["left", "right", "right", "right", "right"],
    budgets,
    (budget) => {
      const remaining = budget.amount_in_cents - budget.total;
      const percentUsed = calculatePercentage(
        budget.total,
        budget.amount_in_cents
      );
      return [
        resolveCategoryName(budget.category_id, categoryMap),
        formatCurrency(budget.amount_in_cents),
        formatCurrency(budget.total),
        formatCurrency(remaining),
        percentUsed,
      ];
    }
  );

  // Create budget status section
  const budgetStatus = [
    "## Budget Status",
    `🟢 **Under Budget:** ${underBudget.length} categories`,
    `🔴 **Over Budget:** ${overBudget.length} categories`,
    `📊 **Overall:** ${overallPercentage}% of budget used`,
  ].join("\n");

  // Return formatted response
  return {
    content: [
      { type: "text", text: summary },
      { type: "text", text: table },
      { type: "text", text: budgetStatus },
      { type: "text", text: buildCappedJson(budgets) },
    ],
  };
}

/**
 * Build response for categories
 */
export function buildCategoriesResponse(
  categories: Category[] | Category
): CallToolResult {
  // Handle single category case
  if (!Array.isArray(categories)) {
    return buildSingleCategoryResponse(categories);
  }

  if (!categories || categories.length === 0) {
    return {
      content: [{ type: "text", text: "No categories found." }],
    };
  }

  // Separate expense and income categories
  const expenseCategories = categories.filter((c) => c.kind === "expenses");
  const incomeCategories = categories.filter((c) => c.kind === "earnings");
  const otherCategories = categories.filter((c) => c.kind === "none");

  // Create summary text
  const summary =
    `You have ${expenseCategories.length} expense categories, ${incomeCategories.length} income categories` +
    `${
      otherCategories.length > 0
        ? `, and ${otherCategories.length} other categories`
        : ""
    }.`;

  // Create expense categories table
  let expenseCategoriesTable = "";
  if (expenseCategories.length > 0) {
    expenseCategoriesTable =
      "## Expense Categories\n" +
      createMarkdownTable<Category>(
        ["Name", "Color", "Essential", "Default", "Archived"],
        ["left", "center", "center", "center", "center"],
        expenseCategories,
        (category) => [
          category.name,
          category.color,
          category.essential ? "✓" : "",
          category.default ? "✓" : "",
          category.archived ? "✓" : "",
        ]
      );
  }

  // Create income categories table
  let incomeCategoriesTable = "";
  if (incomeCategories.length > 0) {
    incomeCategoriesTable =
      "## Income Categories\n" +
      createMarkdownTable<Category>(
        ["Name", "Color", "Default", "Archived"],
        ["left", "center", "center", "center"],
        incomeCategories,
        (category) => [
          category.name,
          category.color,
          category.default ? "✓" : "",
          category.archived ? "✓" : "",
        ]
      );
  }

  const content: CallToolResult["content"] = [
    { type: "text", text: summary },
  ];

  if (expenseCategoriesTable) {
    content.push({ type: "text", text: expenseCategoriesTable });
  }

  if (incomeCategoriesTable) {
    content.push({ type: "text", text: incomeCategoriesTable });
  }

  content.push({ type: "text", text: buildCappedJson(categories) });

  return { content };
}

/**
 * Build response for a single category
 */
function buildSingleCategoryResponse(category: Category): CallToolResult {
  if (!category) {
    return {
      content: [{ type: "text", text: "No category found." }],
    };
  }

  // Create summary text
  const summary = `Category "${category.name}" is a ${category.kind} category${
    category.default ? " and is the default for its type" : ""
  }${category.archived ? " (archived)" : ""}.`;

  // Create markdown details
  const details = [
    "## Category Details",
    `**Name:** ${category.name}`,
    `**Type:** ${category.kind}`,
    `**Color:** ${category.color}`,
    `**Essential:** ${category.essential ? "Yes" : "No"}`,
    `**Default:** ${category.default ? "Yes" : "No"}`,
    `**Archived:** ${category.archived ? "Yes" : "No"}`,
    `**UUID:** ${category.uuid}`,
  ].join("\n");

  // Return formatted response
  return {
    content: [
      { type: "text", text: summary },
      { type: "text", text: details },
      {
        type: "text",
        text: "```json\n" + JSON.stringify(category, null, 2) + "\n```",
      },
    ],
  };
}

function resolveAccountName(
  accountId: number | null,
  accountMap?: Map<number, string> | null
): string {
  if (accountId === null) return "Unknown";
  if (!accountMap) return `Account #${accountId}`;
  return accountMap.get(accountId) ?? `Account #${accountId}`;
}

/**
 * Build response for a list of transfers
 */
export function buildTransfersResponse(
  transfers: Transaction[],
  accountMap?: Map<number, string> | null
): CallToolResult {
  if (!transfers || transfers.length === 0) {
    return {
      content: [{ type: "text", text: "No transfers found." }],
    };
  }

  const sortedTransfers = [...transfers].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalAmount = transfers.reduce(
    (sum, t) => sum + Math.abs(t.amount_cents),
    0
  );

  const startDate = formatDate(
    sortedTransfers[sortedTransfers.length - 1].date
  );
  const endDate = formatDate(sortedTransfers[0].date);
  const dateRangeText =
    startDate === endDate ? startDate : `${startDate} to ${endDate}`;

  const summary =
    `Found ${transfers.length} transfer${transfers.length !== 1 ? "s" : ""} from ${dateRangeText}. ` +
    `Total transferred: ${formatCurrency(totalAmount)}.`;

  const table = createMarkdownTable<Transaction>(
    ["Date", "Description", "Amount", "From", "To", "Paid"],
    ["center", "left", "right", "left", "left", "center"],
    sortedTransfers.slice(0, 10),
    (transfer) => [
      formatShortDate(transfer.date),
      transfer.description || "Transfer",
      formatCurrency(Math.abs(transfer.amount_cents)),
      resolveAccountName(transfer.account_id, accountMap),
      resolveAccountName(transfer.oposite_account_id, accountMap),
      transfer.paid ? "✓" : "✗",
    ]
  );

  const note =
    transfers.length > 10
      ? `\n_Showing 10 of ${transfers.length} transfers._`
      : "";

  return {
    content: [
      { type: "text", text: summary },
      { type: "text", text: table + note },
      { type: "text", text: buildCappedJson(transfers) },
    ],
  };
}

/**
 * Build response for a single transfer
 */
export function buildTransferResponse(
  transfer: Transaction,
  accountMap?: Map<number, string> | null
): CallToolResult {
  if (!transfer) {
    return {
      content: [{ type: "text", text: "No transfer found." }],
    };
  }

  const summary =
    `Transfer of ${formatCurrency(Math.abs(transfer.amount_cents))} ` +
    `from ${resolveAccountName(transfer.account_id, accountMap)} ` +
    `to ${resolveAccountName(transfer.oposite_account_id, accountMap)} ` +
    `on ${formatDate(transfer.date)}. Status: ${transfer.paid ? "Completed" : "Pending"}.`;

  const details = [
    "## Transfer Details",
    `**Description:** ${transfer.description || "Transfer"}`,
    `**Date:** ${formatDate(transfer.date)}`,
    `**Amount:** ${formatCurrency(Math.abs(transfer.amount_cents))}`,
    `**From:** ${resolveAccountName(transfer.account_id, accountMap)}`,
    `**To:** ${resolveAccountName(transfer.oposite_account_id, accountMap)}`,
    `**Status:** ${transfer.paid ? "Completed" : "Pending"}`,
    ...(transfer.notes ? [`**Notes:** ${transfer.notes}`] : []),
    ...(transfer.tags && transfer.tags.length > 0
      ? [`**Tags:** ${transfer.tags.join(", ")}`]
      : []),
  ].join("\n");

  return {
    content: [
      { type: "text", text: summary },
      { type: "text", text: details },
      {
        type: "text",
        text: "```json\n" + JSON.stringify(transfer, null, 2) + "\n```",
      },
    ],
  };
}

export interface BudgetEntry {
  amount_cents: number;
  category_name: string;
}

/**
 * Build response for spending summary
 */
export function buildSpendingSummaryResponse(params: {
  transactions: Transaction[];
  categoryMap: Map<number, string> | null;
  budgetMap?: Map<number, BudgetEntry> | null;
}): CallToolResult {
  const { transactions, categoryMap, budgetMap } = params;

  if (!transactions || transactions.length === 0) {
    return {
      content: [{ type: "text", text: "No transactions found for this period." }],
    };
  }

  // Split into expenses and income (transfers already excluded by caller)
  const expenses = transactions.filter((t) => t.amount_cents < 0);
  const income = transactions.filter((t) => t.amount_cents > 0);

  const totalExpenses = Math.abs(
    expenses.reduce((sum, t) => sum + t.amount_cents, 0)
  );
  const totalIncome = income.reduce((sum, t) => sum + t.amount_cents, 0);
  const net = totalIncome - totalExpenses;

  // Group expenses by category
  const grouped = groupByCategory<Transaction>(
    expenses,
    (t) => resolveCategoryName(t.category_id, categoryMap),
    (t) => Math.abs(t.amount_cents)
  );

  // Build summary
  const summary =
    `**Total income:** ${formatCurrency(totalIncome)} | ` +
    `**Total expenses:** ${formatCurrency(totalExpenses)} | ` +
    `**Net:** ${formatCurrency(net)}`;

  // Build category table
  const hasBudgets = budgetMap && budgetMap.size > 0;

  // Build a reverse lookup: category name -> budget entry
  const budgetByName = new Map<string, BudgetEntry>();
  if (hasBudgets && budgetMap) {
    for (const [catId, entry] of budgetMap.entries()) {
      const name = categoryMap?.get(catId) ?? entry.category_name;
      budgetByName.set(name, entry);
    }
  }

  const headers = ["Category", "Spent", "% of Total"];
  const alignments: ("center" | "left" | "right")[] = ["left", "right", "right"];

  if (hasBudgets) {
    headers.push("Budget", "Remaining", "% Used");
    alignments.push("right", "right", "right");
  }

  const table = createMarkdownTable(
    headers,
    alignments,
    grouped,
    (row) => {
      const base = [
        row.category,
        formatCurrency(row.total),
        row.percentage,
      ];

      if (hasBudgets) {
        const budget = budgetByName.get(row.category);
        if (budget) {
          const remaining = budget.amount_cents - row.total;
          base.push(
            formatCurrency(budget.amount_cents),
            formatCurrency(remaining),
            calculatePercentage(row.total, budget.amount_cents)
          );
        } else {
          base.push("-", "-", "-");
        }
      }

      return base;
    }
  );

  // Build raw JSON payload
  const jsonData = {
    total_income_cents: totalIncome,
    total_expenses_cents: totalExpenses,
    net_cents: net,
    categories: grouped.map((g) => ({
      category: g.category,
      spent_cents: g.total,
      percentage: g.percentage,
      ...(hasBudgets ? (() => {
        const budget = budgetByName.get(g.category);
        return budget
          ? { budget_cents: budget.amount_cents, remaining_cents: budget.amount_cents - g.total }
          : {};
      })() : {}),
    })),
  };

  return {
    content: [
      { type: "text", text: summary },
      { type: "text", text: table },
      { type: "text", text: "```json\n" + JSON.stringify(jsonData, null, 2) + "\n```" },
    ],
  };
}
