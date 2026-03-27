import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatDate,
  formatShortDate,
  calculatePercentage,
  createMarkdownTable,
  groupByCategory,
  buildErrorResponse,
} from "../../utils/formatters.js";

describe("formatCurrency", () => {
  it("formats positive cents as BRL", () => {
    expect(formatCurrency(5000)).toContain("50");
    expect(formatCurrency(5000)).toContain("R$");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toContain("0");
    expect(formatCurrency(0)).toContain("R$");
  });

  it("formats negative cents (expenses)", () => {
    const result = formatCurrency(-5000);
    expect(result).toContain("50");
    expect(result).toContain("R$");
  });

  it("formats large amounts", () => {
    const result = formatCurrency(100000);
    expect(result).toContain("1");
    expect(result).toContain("R$");
  });
});

describe("formatShortDate", () => {
  it("returns YYYY-MM-DD format", () => {
    // Use a noon UTC time to avoid timezone rollback when parsed as UTC midnight
    const result = formatShortDate("2026-03-26T12:00:00Z");
    expect(result).toBe("2026-03-26");
  });

  it("matches YYYY-MM-DD pattern", () => {
    const result = formatShortDate("2026-03-26T12:00:00Z");
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("formatDate", () => {
  it("returns a non-empty string", () => {
    expect(formatDate("2026-03-26")).toBeTruthy();
  });

  it("includes the year", () => {
    expect(formatDate("2026-03-26")).toContain("2026");
  });
});

describe("calculatePercentage", () => {
  it("calculates correct percentage", () => {
    expect(calculatePercentage(50, 100)).toBe("50.0%");
  });

  it("returns 0.0% when total is zero", () => {
    expect(calculatePercentage(0, 0)).toBe("0.0%");
  });

  it("handles 100%", () => {
    expect(calculatePercentage(200, 200)).toBe("100.0%");
  });

  it("rounds to one decimal", () => {
    expect(calculatePercentage(1, 3)).toBe("33.3%");
  });
});

describe("createMarkdownTable", () => {
  it("produces header, separator, and data rows", () => {
    const result = createMarkdownTable(
      ["Name", "Amount"],
      ["left", "right"],
      [{ name: "Groceries", amount: 50 }],
      (row) => [row.name, String(row.amount)]
    );
    const lines = result.split("\n");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toContain("Name");
    expect(lines[0]).toContain("Amount");
    expect(lines[1]).toContain(":---");
    expect(lines[1]).toContain("---:");
    expect(lines[2]).toContain("Groceries");
    expect(lines[2]).toContain("50");
  });

  it("uses correct alignment markers", () => {
    const result = createMarkdownTable(
      ["A", "B", "C"],
      ["left", "center", "right"],
      [],
      () => []
    );
    expect(result).toContain(":---");
    expect(result).toContain(":---:");
    expect(result).toContain("---:");
  });

  it("handles empty rows", () => {
    const result = createMarkdownTable(["Name"], ["left"], [], () => []);
    const lines = result.split("\n").filter(Boolean); // filter trailing empty line
    expect(lines).toHaveLength(2); // header + separator only
  });
});

describe("groupByCategory", () => {
  const items = [
    { category: "Food", amount: 3000 },
    { category: "Food", amount: 2000 },
    { category: "Transport", amount: 1000 },
  ];

  it("groups items by category and sums values", () => {
    const result = groupByCategory(
      items,
      (i) => i.category,
      (i) => i.amount
    );
    const food = result.find((r) => r.category === "Food");
    expect(food?.total).toBe(5000);
  });

  it("sorts by total descending", () => {
    const result = groupByCategory(
      items,
      (i) => i.category,
      (i) => i.amount
    );
    expect(result[0].category).toBe("Food");
    expect(result[1].category).toBe("Transport");
  });

  it("calculates percentages correctly", () => {
    const result = groupByCategory(
      items,
      (i) => i.category,
      (i) => i.amount
    );
    const food = result.find((r) => r.category === "Food");
    expect(food?.percentage).toBe("83.3%");
  });

  it("returns empty array for empty input", () => {
    const result = groupByCategory([], () => "", () => 0);
    expect(result).toHaveLength(0);
  });
});

describe("buildErrorResponse", () => {
  it("returns isError: true", () => {
    const result = buildErrorResponse(new Error("test"), "get accounts");
    expect(result.isError).toBe(true);
  });

  it("includes the context in the message", () => {
    const result = buildErrorResponse(new Error("something"), "get accounts");
    const text = result.content[0].text as string;
    expect(text).toContain("get accounts");
  });

  it("suggests credential fix for 401", () => {
    const result = buildErrorResponse(
      new Error("HTTP error! status: 401"),
      "get accounts"
    );
    const texts = result.content.map((c) => c.text as string).join(" ");
    expect(texts.toLowerCase()).toContain("credentials");
  });

  it("suggests not found message for 404", () => {
    const result = buildErrorResponse(
      new Error("HTTP error! status: 404"),
      "get transaction"
    );
    const texts = result.content.map((c) => c.text as string).join(" ");
    expect(texts.toLowerCase()).toContain("found");
  });

  it("suggests retry for 429", () => {
    const result = buildErrorResponse(
      new Error("HTTP error! status: 429"),
      "get accounts"
    );
    const texts = result.content.map((c) => c.text as string).join(" ");
    expect(texts.toLowerCase()).toContain("rate limit");
  });

  it("suggests connectivity check for timeout", () => {
    const result = buildErrorResponse(
      new Error("request timeout"),
      "get accounts"
    );
    const texts = result.content.map((c) => c.text as string).join(" ");
    expect(texts.toLowerCase()).toContain("timeout");
  });
});
