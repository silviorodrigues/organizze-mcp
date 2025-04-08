import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { organizzeService } from "./services/organizze.service.js";
import { z } from "zod";

const server = new McpServer({
  name: "organizze-mcp",
  version: "0.0.1",
  description: "MCP server for Organizze API",
});

server.tool("get-bank-accounts", "Get a list of bank accounts", async (_) => {
  try {
    const response = await organizzeService.getBankAccounts();

    if (!response || response.length === 0) {
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
});


server.tool("get-budgets", "Get a list of target budgets", {
  year: z.string().optional(),
  month: z.string().optional(),
}, async ({year, month}) => {
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
});

server.tool("get-categories", "Get a list of categories or a single category by id", {
  category_id: z.number().optional(),
}, async ({category_id}) => {
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
});

const transport = new StdioServerTransport();
await server.connect(transport);