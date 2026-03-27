import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { Budget } from "../../models/organizze.models.js";
import {
  formatCurrency,
  calculatePercentage,
  createMarkdownTable,
} from "../formatters.js";
import { buildCappedJson, resolveCategoryName } from "./shared.js";

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
          text: `No budgets found${year ? ` for ${year}${month ? `-${month}` : ""}` : ""}.`,
        },
      ],
    };
  }

  const underBudget = budgets.filter((b) => b.total <= b.amount_in_cents);
  const overBudget = budgets.filter((b) => b.total > b.amount_in_cents);
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount_in_cents, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.total, 0);
  const overallPercentage = calculatePercentage(totalSpent, totalBudget).replace("%", "");

  const periodText = year ? ` for ${month ? `${month}/${year}` : year}` : "";
  const summary =
    `You have ${budgets.length} budget categories${periodText}. ` +
    `You're under budget in ${underBudget.length} categories and over budget in ${overBudget.length} categories. ` +
    `Overall, you've spent ${overallPercentage}% of your total monthly budget.`;

  const table = createMarkdownTable<Budget>(
    ["Category", "Budget", "Spent", "Remaining", "% Used"],
    ["left", "right", "right", "right", "right"],
    budgets,
    (budget) => {
      const remaining = budget.amount_in_cents - budget.total;
      const percentUsed = calculatePercentage(budget.total, budget.amount_in_cents);
      return [
        resolveCategoryName(budget.category_id, categoryMap),
        formatCurrency(budget.amount_in_cents),
        formatCurrency(budget.total),
        formatCurrency(remaining),
        percentUsed,
      ];
    }
  );

  const budgetStatus = [
    "## Budget Status",
    `🟢 **Under Budget:** ${underBudget.length} categories`,
    `🔴 **Over Budget:** ${overBudget.length} categories`,
    `📊 **Overall:** ${overallPercentage}% of budget used`,
  ].join("\n");

  return {
    content: [
      { type: "text", text: summary },
      { type: "text", text: table },
      { type: "text", text: budgetStatus },
      { type: "text", text: buildCappedJson(budgets) },
    ],
  };
}
