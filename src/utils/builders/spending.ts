import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { Transaction } from "../../models/organizze.models.js";
import {
  formatCurrency,
  calculatePercentage,
  createMarkdownTable,
  groupByCategory,
} from "../formatters.js";
import { resolveCategoryName } from "./shared.js";

export interface BudgetEntry {
  amount_cents: number;
  category_name: string;
}

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

  const expenses = transactions.filter((t) => t.amount_cents < 0);
  const income = transactions.filter((t) => t.amount_cents > 0);
  const totalExpenses = Math.abs(expenses.reduce((sum, t) => sum + t.amount_cents, 0));
  const totalIncome = income.reduce((sum, t) => sum + t.amount_cents, 0);
  const net = totalIncome - totalExpenses;

  const grouped = groupByCategory<Transaction>(
    expenses,
    (t) => resolveCategoryName(t.category_id, categoryMap),
    (t) => Math.abs(t.amount_cents)
  );

  const summary =
    `**Total income:** ${formatCurrency(totalIncome)} | ` +
    `**Total expenses:** ${formatCurrency(totalExpenses)} | ` +
    `**Net:** ${formatCurrency(net)}`;

  const hasBudgets = budgetMap && budgetMap.size > 0;

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
      const base = [row.category, formatCurrency(row.total), row.percentage];
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

  const jsonData = {
    total_income_cents: totalIncome,
    total_expenses_cents: totalExpenses,
    net_cents: net,
    categories: grouped.map((g) => ({
      category: g.category,
      spent_cents: g.total,
      percentage: g.percentage,
      ...(hasBudgets
        ? (() => {
            const budget = budgetByName.get(g.category);
            return budget
              ? {
                  budget_cents: budget.amount_cents,
                  remaining_cents: budget.amount_cents - g.total,
                }
              : {};
          })()
        : {}),
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
