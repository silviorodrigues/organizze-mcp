import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import {
  CreditCardInvoice,
  DetailedInvoice,
  Transaction,
} from "../../models/organizze.models.js";
import {
  formatCurrency,
  formatDate,
  formatShortDate,
  createMarkdownTable,
} from "../formatters.js";
import { buildCappedJson, resolveCategoryName } from "./shared.js";

export function buildCreditCardInvoicesResponse(
  invoices: CreditCardInvoice[],
  creditCardId: number
): CallToolResult {
  if (!invoices || invoices.length === 0) {
    return {
      content: [{ type: "text", text: "No invoices found for this credit card." }],
    };
  }

  const sortedInvoices = [...invoices].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const mostRecent = sortedInvoices[0];

  const summary =
    `You have ${invoices.length} invoice${invoices.length !== 1 ? "s" : ""} for this credit card. ` +
    `The most recent invoice is for ${formatDate(mostRecent.date)} with a balance of ${formatCurrency(
      mostRecent.amount_cents
    )}.`;

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

  return {
    content: [
      { type: "text", text: summary },
      { type: "text", text: table },
      { type: "text", text: buildCappedJson(invoices) },
    ],
  };
}

export function buildInvoiceDetailsResponse(
  invoice: DetailedInvoice,
  categoryMap?: Map<number, string> | null,
  payments?: Transaction[] | null
): CallToolResult {
  if (!invoice) {
    return { content: [{ type: "text", text: "No invoice details found." }] };
  }

  let largestTransaction = { amount_cents: 0, description: "" };
  if (invoice.transactions && invoice.transactions.length > 0) {
    largestTransaction = invoice.transactions.reduce(
      (max, transaction) =>
        transaction.amount_cents > max.amount_cents ? transaction : max,
      { amount_cents: 0, description: "" } as Transaction
    );
  }

  const summary =
    `This invoice has a balance of ${formatCurrency(invoice.balance_cents)} for the period from ` +
    `${formatDate(invoice.starting_date)} to ${formatDate(invoice.closing_date)}.` +
    (invoice.transactions.length > 0
      ? ` It includes ${invoice.transactions.length} transactions, ` +
        `with the largest being ${formatCurrency(largestTransaction.amount_cents)} at '${largestTransaction.description}'.`
      : "");

  let paymentStatus: string;
  if (invoice.balance_cents === 0) {
    paymentStatus = "Paid in full";
  } else if (invoice.payment_amount_cents > 0) {
    paymentStatus = "Partially paid";
  } else {
    paymentStatus = "Unpaid";
  }

  const statementSummary = [
    "## Statement Summary",
    `**Period:** ${formatDate(invoice.starting_date)} - ${formatDate(invoice.closing_date)}`,
    `**Total:** ${formatCurrency(invoice.amount_cents)}`,
    `**Payment:** ${formatCurrency(invoice.payment_amount_cents)}`,
    `**Balance:** ${formatCurrency(invoice.balance_cents)}`,
    `**Previous Balance:** ${formatCurrency(invoice.previous_balance_cents)}`,
    `**Status:** ${paymentStatus}`,
  ].join("\n");

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

  const allPayments =
    payments && payments.length > 0
      ? payments
      : invoice.payments && invoice.payments.length > 0
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
