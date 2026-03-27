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
} from "./formatters.js";

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
      {
        type: "text",
        text: "```json\n" + JSON.stringify(accounts, null, 2) + "\n```",
      },
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
      {
        type: "text",
        text: "```json\n" + JSON.stringify(cards, null, 2) + "\n```",
      },
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
      {
        type: "text",
        text: "```json\n" + JSON.stringify(invoices, null, 2) + "\n```",
      },
    ],
  };
}

/**
 * Build response for invoice details
 */
export function buildInvoiceDetailsResponse(
  invoice: DetailedInvoice
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
          `Category ID: ${transaction.category_id}`, // Would be better with actual category name
        ]
      );
  }

  // Return formatted response
  return {
    content: [
      { type: "text", text: summary },
      { type: "text", text: statementSummary },
      transactionsTable
        ? { type: "text", text: transactionsTable }
        : { type: "text", text: "" },
      {
        type: "text",
        text: "```json\n" + JSON.stringify(invoice, null, 2) + "\n```",
      },
    ],
  };
}

/**
 * Build response for transactions
 */
export function buildTransactionsResponse(
  transactions: Transaction[]
): CallToolResult {
  if (!transactions || transactions.length === 0) {
    return {
      content: [{ type: "text", text: "No transactions found." }],
    };
  }

  // Calculate total spending (only for expenses)
  const expenses = transactions.filter((t) => t.amount_cents < 0);
  const totalSpending = Math.abs(
    expenses.reduce((sum, t) => sum + t.amount_cents, 0)
  );

  // Find largest transaction
  const largestExpense = expenses.reduce(
    (max, transaction) =>
      Math.abs(transaction.amount_cents) > Math.abs(max.amount_cents)
        ? transaction
        : max,
    { amount_cents: 0, description: "" } as Transaction
  );

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

  // Create summary text
  const summary =
    `Found ${transactions.length} transaction${
      transactions.length !== 1 ? "s" : ""
    } from ${dateRangeText}.` +
    (expenses.length > 0
      ? ` Total spending: ${formatCurrency(totalSpending)}.` +
        ` Largest expense: ${formatCurrency(
          Math.abs(largestExpense.amount_cents)
        )} at '${largestExpense.description}'.`
      : "");

  // Create transactions table
  const table = createMarkdownTable<Transaction>(
    ["Date", "Description", "Amount", "Paid", "Category ID"],
    ["center", "left", "right", "center", "center"],
    sortedTransactions.slice(0, 10), // Limit to 10 transactions for readability
    (transaction) => [
      formatShortDate(transaction.date),
      transaction.description,
      formatCurrency(transaction.amount_cents),
      transaction.paid ? "✓" : "✗",
      transaction.category_id.toString(),
    ]
  );

  // Add note if there are more than 10 transactions
  const note =
    transactions.length > 10
      ? `\n_Showing 10 of ${transactions.length} transactions. Full data available in the JSON below._`
      : "";

  // Return formatted response
  return {
    content: [
      { type: "text", text: summary },
      { type: "text", text: table + note },
      {
        type: "text",
        text: "```json\n" + JSON.stringify(transactions, null, 2) + "\n```",
      },
    ],
  };
}

/**
 * Build response for a single transaction
 */
export function buildTransactionResponse(
  transaction: Transaction
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
    `**Category ID:** ${transaction.category_id}`,
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
  month?: string
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
    ["Category ID", "Budget", "Spent", "Remaining", "% Used"],
    ["center", "right", "right", "right", "right"],
    budgets,
    (budget) => {
      const remaining = budget.amount_in_cents - budget.total;
      const percentUsed = calculatePercentage(
        budget.total,
        budget.amount_in_cents
      );
      return [
        budget.category_id.toString(),
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
      {
        type: "text",
        text: "```json\n" + JSON.stringify(budgets, null, 2) + "\n```",
      },
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

  // Return formatted response
  return {
    content: [
      { type: "text", text: summary },
      expenseCategoriesTable
        ? { type: "text", text: expenseCategoriesTable }
        : { type: "text", text: "" },
      incomeCategoriesTable
        ? { type: "text", text: incomeCategoriesTable }
        : { type: "text", text: "" },
      {
        type: "text",
        text: "```json\n" + JSON.stringify(categories, null, 2) + "\n```",
      },
    ],
  };
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
