import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { Transaction } from "../../models/organizze.models.js";
import {
  formatCurrency,
  formatDate,
  formatShortDate,
  createMarkdownTable,
} from "../formatters.js";
import { buildCappedJson, resolveAccountName } from "./shared.js";

export function buildTransfersResponse(
  transfers: Transaction[],
  accountMap?: Map<number, string> | null
): CallToolResult {
  if (!transfers || transfers.length === 0) {
    return { content: [{ type: "text", text: "No transfers found." }] };
  }

  const sortedTransfers = [...transfers].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const totalAmount = transfers.reduce((sum, t) => sum + Math.abs(t.amount_cents), 0);

  const startDate = formatDate(sortedTransfers[sortedTransfers.length - 1].date);
  const endDate = formatDate(sortedTransfers[0].date);
  const dateRangeText = startDate === endDate ? startDate : `${startDate} to ${endDate}`;

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
    transfers.length > 10 ? `\n_Showing 10 of ${transfers.length} transfers._` : "";

  return {
    content: [
      { type: "text", text: summary },
      { type: "text", text: table + note },
      { type: "text", text: buildCappedJson(transfers) },
    ],
  };
}

export function buildTransferResponse(
  transfer: Transaction,
  accountMap?: Map<number, string> | null
): CallToolResult {
  if (!transfer) {
    return { content: [{ type: "text", text: "No transfer found." }] };
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
      { type: "text", text: "```json\n" + JSON.stringify(transfer, null, 2) + "\n```" },
    ],
  };
}
