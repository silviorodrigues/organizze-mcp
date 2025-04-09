import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { organizzeService } from "./services/organizze.service.js";
import { z } from "zod";

const server = new McpServer({
  name: "organizze-mcp",
  version: "0.0.2",
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

      return {
        content: [
          {
            type: "text",
            text: "Bank accounts found",
          },
          {
            type: "text",
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to get bank accounts: ${error.message}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: "An unknown error occurred",
          },
        ],
      };
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

      return {
        content: [
          {
            type: "text",
            text: "Credit cards found",
          },
          {
            type: "text",
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to get credit cards: ${error.message}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: "An unknown error occurred",
          },
        ],
      };
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

      return {
        content: [
          {
            type: "text",
            text: "Credit card invoices found",
          },
          {
            type: "text",
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to get credit card invoices: ${error.message}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: "An unknown error occurred",
          },
        ],
      };
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

      return {
        content: [
          {
            type: "text",
            text: "Budgets found",
          },
          {
            type: "text",
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to get budgets: ${error.message}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: "An unknown error occurred",
          },
        ],
      };
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

      return {
        content: [
          {
            type: "text",
            text: "Categories found",
          },
          {
            type: "text",
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to get categories: ${error.message}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: "An unknown error occurred",
          },
        ],
      };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
