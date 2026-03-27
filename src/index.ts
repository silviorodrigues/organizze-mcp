import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { organizzeService } from "./services/organizze.service.js";
import { z } from "zod";
import { buildErrorResponse } from "./utils/formatters.js";
import {
  buildBankAccountsResponse,
  buildCreditCardsResponse,
  buildCreditCardInvoicesResponse,
  buildInvoiceDetailsResponse,
  buildTransactionsResponse,
  buildTransactionResponse,
  buildBudgetsResponse,
  buildCategoriesResponse
} from "./utils/response-builders.js";

const server = new McpServer({
  name: "organizze-mcp",
  version: "0.1.0",
  description: "MCP server for Organizze API",
});

server.tool(
  "get-bank-accounts",
  "List all bank accounts or fetch one by ID. Use this first to discover account IDs needed by other tools like get-transactions and get-transfers.",
  {
    account_id: z.number().optional().describe("Organizze account ID. Omit to list all accounts."),
  },
  async ({ account_id }) => {
    try {
      const response = await organizzeService.getBankAccounts(account_id);

      if (!response) {
        return {
          content: [
            {
              type: "text",
              text: "No bank accounts found",
            },
          ],
        };
      }

      return buildBankAccountsResponse(response);
    } catch (error) {
      return buildErrorResponse(error instanceof Error ? error : new Error("Unknown error"), "get bank accounts");
    }
  }
);

server.tool(
  "get-credit-cards",
  "List all credit cards or fetch one by ID. Use this to discover credit card IDs needed by get-credit-cards-invoices and get-credit-cards-invoice-details.",
  {
    credit_card_id: z.number().optional().describe("Organizze credit card ID. Omit to list all cards."),
  },
  async ({ credit_card_id }) => {
    try {
      const response = await organizzeService.getCreditCards(credit_card_id);

      if (!response) {
        return {
          content: [
            {
              type: "text",
              text: "No credit cards found",
            },
          ],
        };
      }

      return buildCreditCardsResponse(response);
    } catch (error) {
      return buildErrorResponse(error instanceof Error ? error : new Error("Unknown error"), "get credit cards");
    }
  }
);

server.tool(
  "get-credit-cards-invoices",
  "List invoices for a credit card. Use get-credit-cards first to find the credit card ID. Defaults to the current year if no date range is provided.",
  {
    credit_card_id: z.number().describe("Credit card ID from get-credit-cards."),
    date_range: z.object({
      start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("Start date in YYYY-MM-DD format."),
      end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("End date in YYYY-MM-DD format."),
    }).optional().describe("Filter invoices to a date range. Defaults to current year if omitted."),
  },
  async ({ credit_card_id, date_range }) => {
    try {
      const response = await organizzeService.getCreditCardInvoices(credit_card_id, date_range);

      if (!response) {
        return {
          content: [
            {
              type: "text",
              text: "No credit card invoices found",
            },
          ],
        };
      }

      return buildCreditCardInvoicesResponse(response, credit_card_id);
    } catch (error) {
      return buildErrorResponse(error instanceof Error ? error : new Error("Unknown error"), "get credit card invoices");
    }
  }
);

server.tool(
  "get-credit-cards-invoice-details",
  "Get full details of a credit card invoice including all line-item transactions. Use get-credit-cards-invoices first to find the invoice ID.",
  {
    credit_card_id: z.number().describe("Credit card ID from get-credit-cards."),
    invoice_id: z.number().describe("Invoice ID from get-credit-cards-invoices."),
  },
  async ({ credit_card_id, invoice_id }) => {
    try {
      const response = await organizzeService.getInvoiceDetails(credit_card_id, invoice_id);

      if (!response) {
        return {
          content: [
            {
              type: "text",
              text: "No invoice found",
            },
          ],
        };
      }

      const categoryMap = await organizzeService.getCategoryMap();
      return buildInvoiceDetailsResponse(response, categoryMap);
    } catch (error) {
      return buildErrorResponse(error instanceof Error ? error : new Error("Unknown error"), "get credit card invoice details");
    }
  }
);

server.tool(
  "get-transactions",
  "List transactions for a date range, optionally filtered by account. Use this to analyze spending, find specific purchases, or review recent activity. Defaults to the current month if no date range is provided. For best results, query one month at a time.",
  {
    account_id: z.number().optional().describe("Filter by bank account ID from get-bank-accounts. Omit to include all accounts."),
    date_range: z.object({
      start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("Start date in YYYY-MM-DD format."),
      end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("End date in YYYY-MM-DD format."),
    }).optional().describe("Filter to a date range. Defaults to current month if omitted. For best results, query one month at a time."),
  },
  async ({ account_id, date_range }) => {
    try {
      const response = await organizzeService.getTransactions({
        account_id,
        date_range,
      });

      if (!response) {
        return {
          content: [
            {
              type: "text",
              text: "No transactions found",
            },
          ],
        };
      }

      const categoryMap = await organizzeService.getCategoryMap();
      return buildTransactionsResponse(response, categoryMap);
    } catch (error) {
      return buildErrorResponse(error instanceof Error ? error : new Error("Unknown error"), "get transactions");
    }
  }
);


server.tool(
  "get-transaction",
  "Get full details of a single transaction by ID, including recurring/installment info, tags, and notes. Use get-transactions first to find the transaction ID.",
  {
    transaction_id: z.number().describe("Transaction ID from get-transactions or get-credit-cards-invoice-details."),
  },
  async ({ transaction_id }) => {
    try {
      const response = await organizzeService.getTransaction(transaction_id);

      if (!response) {
        return {
          content: [
            {
              type: "text",
              text: "No transaction found",
            },
          ],
        };
      }

      const categoryMap = await organizzeService.getCategoryMap();
      return buildTransactionResponse(response, categoryMap);
    } catch (error) {
      return buildErrorResponse(error instanceof Error ? error : new Error("Unknown error"), "get transaction");
    }
  }
);

server.tool(
  "get-budgets",
  "Get monthly or annual budget targets by category. Use this to check spending limits and compare against actual spending from get-transactions.",
  {
    year: z.string().regex(/^\d{4}$/).optional().describe("Year in YYYY format, e.g. '2026'. Omit for all budgets."),
    month: z.string().regex(/^\d{1,2}$/).optional().describe("Month as 1-12, e.g. '3' for March. Requires year to be set."),
  },
  async ({ year, month }) => {
    try {
      const response = await organizzeService.getBudgets(year, month);

      if (!response || response.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No budgets found",
            },
          ],
        };
      }

      const categoryMap = await organizzeService.getCategoryMap();
      return buildBudgetsResponse(response, undefined, undefined, categoryMap);
    } catch (error) {
      return buildErrorResponse(error instanceof Error ? error : new Error("Unknown error"), "get budgets");
    }
  }
);

server.tool(
  "get-categories",
  "List all categories or fetch one by ID. Use this to discover category IDs and names needed to interpret transactions and budgets. Categories are split into expense, income, and other types.",
  {
    category_id: z.number().optional().describe("Organizze category ID. Omit to list all categories."),
  },
  async ({ category_id }) => {
    try {
      const response = await organizzeService.getCategories(category_id);

      if (!response) {
        return {
          content: [
            {
              type: "text",
              text: "No categories found",
            },
          ],
        };
      }

      return buildCategoriesResponse(response);
    } catch (error) {
      return buildErrorResponse(error instanceof Error ? error : new Error("Unknown error"), "get categories");
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
