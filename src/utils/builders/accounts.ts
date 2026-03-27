import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { BankAccount } from "../../models/organizze.models.js";
import { formatDate, formatShortDate, createMarkdownTable } from "../formatters.js";
import { buildCappedJson } from "./shared.js";

export function buildBankAccountsResponse(
  accounts: BankAccount[] | BankAccount
): CallToolResult {
  if (!Array.isArray(accounts)) {
    return buildSingleBankAccountResponse(accounts);
  }

  const defaultAccount = accounts.find((account) => account.default);
  const summary = `You have ${accounts.length} bank account${
    accounts.length !== 1 ? "s" : ""
  }.${
    defaultAccount
      ? ` Your primary ${defaultAccount.type} account is "${defaultAccount.name}".`
      : ""
  }`;

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

  return {
    content: [
      { type: "text", text: summary },
      { type: "text", text: table },
      { type: "text", text: buildCappedJson(accounts) },
    ],
  };
}

function buildSingleBankAccountResponse(account: BankAccount): CallToolResult {
  const summary = `Your ${account.name} ${account.type} account${
    account.default ? " is your default account" : ""
  }.`;

  const details = [
    "## Account Details",
    `**Name:** ${account.name}`,
    `**Type:** ${account.type}`,
    `**Default:** ${account.default ? "Yes" : "No"}`,
    `**Created:** ${formatDate(account.created_at)}`,
    `**Last Updated:** ${formatDate(account.updated_at)}`,
  ].join("\n");

  return {
    content: [
      { type: "text", text: summary },
      { type: "text", text: details },
      { type: "text", text: "```json\n" + JSON.stringify(account, null, 2) + "\n```" },
    ],
  };
}
