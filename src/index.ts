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
  "Get a list of bank accounts or a single bank account by id",
  {
    account_id: z.number().optional(),
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
  "Get a list of credit cards or a single credit card by id",
  {
    credit_card_id: z.number().optional(),
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
  "Get a list of credit cards invoices by credit card id",
  {
    credit_card_id: z.number(),
    date_range: z.object({
      start_date: z.string(),
      end_date: z.string(),
    }).optional(),
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
  "Get details about an credit card invoice",
  {
    credit_card_id: z.number(),
    invoice_id: z.number(),
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

      return buildInvoiceDetailsResponse(response);
    } catch (error) {
      return buildErrorResponse(error instanceof Error ? error : new Error("Unknown error"), "get credit card invoice details");
    }
  }
);

server.tool(
  "get-transactions",
  "Get a list of transactions",
  {
    account_id: z.number().optional(),
    date_range: z.object({
      start_date: z.string(),
      end_date: z.string(),
    }).optional(),
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

      return buildTransactionsResponse(response);
    } catch (error) {
      return buildErrorResponse(error instanceof Error ? error : new Error("Unknown error"), "get transactions");
    }
  }
);


server.tool(
  "get-transaction",
  "Get details about a transaction",
  {
    transaction_id: z.number()
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

      return buildTransactionResponse(response);
    } catch (error) {
      return buildErrorResponse(error instanceof Error ? error : new Error("Unknown error"), "get transaction");
    }
  }
);

server.tool(
  "get-budgets",
  "Get a list of target budgets",
  {
    year: z.string().optional(),
    month: z.string().optional(),
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

      return buildBudgetsResponse(response);
    } catch (error) {
      return buildErrorResponse(error instanceof Error ? error : new Error("Unknown error"), "get budgets");
    }
  }
);

server.tool(
  "get-categories",
  "Get a list of categories or a single category by id",
  {
    category_id: z.number().optional(),
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
