import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { Category } from "../../models/organizze.models.js";
import { createMarkdownTable } from "../formatters.js";
import { buildCappedJson } from "./shared.js";

export function buildCategoriesResponse(
  categories: Category[] | Category
): CallToolResult {
  if (!Array.isArray(categories)) {
    return buildSingleCategoryResponse(categories);
  }

  if (!categories || categories.length === 0) {
    return { content: [{ type: "text", text: "No categories found." }] };
  }

  const expenseCategories = categories.filter((c) => c.kind === "expenses");
  const incomeCategories = categories.filter((c) => c.kind === "earnings");
  const otherCategories = categories.filter((c) => c.kind === "none");

  const summary =
    `You have ${expenseCategories.length} expense categories, ${incomeCategories.length} income categories` +
    `${otherCategories.length > 0 ? `, and ${otherCategories.length} other categories` : ""}.`;

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

  const content: CallToolResult["content"] = [{ type: "text", text: summary }];
  if (expenseCategoriesTable) content.push({ type: "text", text: expenseCategoriesTable });
  if (incomeCategoriesTable) content.push({ type: "text", text: incomeCategoriesTable });
  content.push({ type: "text", text: buildCappedJson(categories) });

  return { content };
}

function buildSingleCategoryResponse(category: Category): CallToolResult {
  if (!category) {
    return { content: [{ type: "text", text: "No category found." }] };
  }

  const summary = `Category "${category.name}" is a ${category.kind} category${
    category.default ? " and is the default for its type" : ""
  }${category.archived ? " (archived)" : ""}.`;

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

  return {
    content: [
      { type: "text", text: summary },
      { type: "text", text: details },
      { type: "text", text: "```json\n" + JSON.stringify(category, null, 2) + "\n```" },
    ],
  };
}
