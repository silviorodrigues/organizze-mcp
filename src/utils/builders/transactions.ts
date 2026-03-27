import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { Transaction } from "../../models/organizze.models.js";
import {
  formatCurrency,
  formatDate,
  formatShortDate,
  createMarkdownTable,
} from "../formatters.js";
import { buildCappedJson, resolveCategoryName } from "./shared.js";

export function buildTransactionsResponse(
  transactions: Transaction[],
  categoryMap?: Map<number, string> | null
): CallToolResult {
  if (!transactions || transactions.length === 0) {
    return { content: [{ type: "text", text: "No transactions found." }] };
  }

  const expenses = transactions.filter((t) => t.amount_cents < 0);
  const income = transactions.filter((t) => t.amount_cents > 0);
  const totalSpending = Math.abs(expenses.reduce((sum, t) => sum + t.amount_cents, 0));
  const totalIncome = income.reduce((sum, t) => sum + t.amount_cents, 0);

  const largestExpense =
    expenses.length > 0
      ? expenses.reduce(
          (max, transaction) =>
            Math.abs(transaction.amount_cents) > Math.abs(max.amount_cents)
              ? transaction
              : max,
          { amount_cents: 0, description: "" } as Transaction
        )
      : null;

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const startDate = formatDate(sortedTransactions[sortedTransactions.length - 1].date);
  const endDate = formatDate(sortedTransactions[0].date);
  const dateRangeText = startDate === endDate ? startDate : `${startDate} to ${endDate}`;

  const hasRecurring = transactions.some((t) => t.recurring);
  const hasInstallments = transactions.some((t) => t.total_installments > 1);

  let summary = `Found ${transactions.length} transaction${
    transactions.length !== 1 ? "s" : ""
  } from ${dateRangeText}.`;

  if (totalIncome > 0) summary += ` Total income: ${formatCurrency(totalIncome)}.`;
  if (expenses.length > 0) summary += ` Total spending: ${formatCurrency(totalSpending)}.`;
  if (largestExpense && largestExpense.amount_cents !== 0) {
    summary += ` Largest expense: ${formatCurrency(Math.abs(largestExpense.amount_cents))} at '${largestExpense.description}'.`;
  }

  const headers = ["Date", "Description", "Amount", "Paid", "Category"];
  const alignments: ("center" | "left" | "right")[] = [
    "center",
    "left",
    "right",
    "center",
    "left",
  ];

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
      if (hasRecurring) row.push(transaction.recurring ? "✓" : "");
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

export function buildTransactionResponse(
  transaction: Transaction,
  categoryMap?: Map<number, string> | null
): CallToolResult {
  if (!transaction) {
    return { content: [{ type: "text", text: "No transaction found." }] };
  }

  const summary =
    `Transaction of ${formatCurrency(transaction.amount_cents)} for '${transaction.description}' on ${formatDate(
      transaction.date
    )}.` + ` Status: ${transaction.paid ? "Paid" : "Not paid"}.`;

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

  return {
    content: [
      { type: "text", text: summary },
      { type: "text", text: details },
      { type: "text", text: "```json\n" + JSON.stringify(transaction, null, 2) + "\n```" },
    ],
  };
}
