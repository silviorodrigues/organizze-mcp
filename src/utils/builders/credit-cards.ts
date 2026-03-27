import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { CreditCard } from "../../models/organizze.models.js";
import { formatCurrency, formatDate, createMarkdownTable } from "../formatters.js";
import { buildCappedJson } from "./shared.js";

export function buildCreditCardsResponse(
  cards: CreditCard[] | CreditCard
): CallToolResult {
  if (!Array.isArray(cards)) {
    return buildSingleCreditCardResponse(cards);
  }

  const summary = `You have ${cards.length} credit card${
    cards.length !== 1 ? "s" : ""
  }.${
    cards.length > 0
      ? ` Your ${
          cards.find((card) => card.default)?.name || cards[0].name
        } card has a limit of ${formatCurrency(
          cards.find((card) => card.default)?.limit_cents || cards[0].limit_cents
        )}.`
      : ""
  }`;

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

  return {
    content: [
      { type: "text", text: summary },
      { type: "text", text: table },
      { type: "text", text: buildCappedJson(cards) },
    ],
  };
}

function buildSingleCreditCardResponse(card: CreditCard): CallToolResult {
  const summary = `Your ${card.name} ${card.card_network} card has a limit of ${formatCurrency(
    card.limit_cents
  )} and ${card.default ? "is your default card" : "is not your default card"}.`;

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

  return {
    content: [
      { type: "text", text: summary },
      { type: "text", text: details },
      { type: "text", text: "```json\n" + JSON.stringify(card, null, 2) + "\n```" },
    ],
  };
}
