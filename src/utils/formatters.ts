/**
 * Utility functions for formatting data in MCP tool responses
 */

import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

/**
 * Format a number as currency (BRL)
 * @param amountCents Amount in cents
 * @returns Formatted currency string
 */
export function formatCurrency(amountCents: number): string {
  const amount = amountCents / 100;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

/**
 * Format a date string into a human-readable format
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * Format a date string into a short format (YYYY-MM-DD)
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replace(/(\d+)\/(\d+)\/(\d+)/, "$3-$2-$1");
}

/**
 * Calculate percentage and format as string
 * @param value The value
 * @param total The total
 * @returns Formatted percentage string
 */
export function calculatePercentage(value: number, total: number): string {
  if (total === 0) return "0.0%";
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(1)}%`;
}

/**
 * Create a markdown table
 * @param headers Table headers
 * @param alignments Column alignments ('left', 'center', 'right')
 * @param rows Table data rows
 * @returns Markdown table string
 */
export function createMarkdownTable<T>(
  headers: string[],
  alignments: ("left" | "center" | "right")[],
  rows: T[],
  getRowData: (item: T) => string[]
): string {
  // Create header row
  const headerRow = `| ${headers.join(" | ")} |`;

  // Create alignment row
  const alignmentRow = `| ${alignments
    .map((align) => {
      switch (align) {
        case "left":
          return ":---";
        case "center":
          return ":---:";
        case "right":
          return "---:";
        default:
          return "---";
      }
    })
    .join(" | ")} |`;

  // Create data rows
  const dataRows = rows
    .map((item) => `| ${getRowData(item).join(" | ")} |`)
    .join("\n");

  return `${headerRow}\n${alignmentRow}\n${dataRows}`;
}

/**
 * Group items by category and calculate totals and percentages
 * @param items Array of items to group
 * @param categoryGetter Function to extract category from an item
 * @param valueGetter Function to extract value from an item
 * @returns Array of grouped items with totals and percentages
 */
export function groupByCategory<T>(
  items: T[],
  categoryGetter: (item: T) => string,
  valueGetter: (item: T) => number
): { category: string; total: number; percentage: string }[] {
  const groups = new Map<string, number>();
  let grandTotal = 0;

  // Group items and calculate totals
  for (const item of items) {
    const category = categoryGetter(item);
    const value = valueGetter(item);
    grandTotal += value;

    const currentTotal = groups.get(category) || 0;
    groups.set(category, currentTotal + value);
  }

  // Convert to array and calculate percentages
  return Array.from(groups.entries())
    .map(([category, total]) => ({
      category,
      total,
      percentage: calculatePercentage(total, grandTotal),
    }))
    .sort((a, b) => b.total - a.total); // Sort by total in descending order
}

/**
 * Build a standard error response
 * @param error Error object
 * @param context Context description (e.g., "get bank accounts")
 * @returns Formatted error response
 */
export function buildErrorResponse(
  error: Error,
  context: string
): CallToolResult {
  // Extract error message
  const errorMessage = error.message;

  // Create helpful suggestions based on error type
  let suggestion = "";
  if (errorMessage.includes("401")) {
    suggestion =
      "This may be due to invalid API credentials. Please check your Organizze username and API key.";
  } else if (errorMessage.includes("404")) {
    suggestion = `The requested ${context} could not be found. Please verify the ID is correct.`;
  } else if (errorMessage.includes("429")) {
    suggestion =
      "You have exceeded the API rate limit. Please try again later.";
  } else if (errorMessage.includes("timeout")) {
    suggestion =
      "The request timed out. Please check your internet connection and try again.";
  }

  // Return formatted error response
  return {
    content: [
      {
        type: "text",
        text: `⚠️ Error: Failed to ${context}: ${errorMessage}`,
      },
      suggestion
        ? {
            type: "text",
            text: `💡 ${suggestion}`,
          }
        : {
            type: "text",
            text: "Please check the API documentation for more information.",
          },
    ],
    isError: true,
  };
}
