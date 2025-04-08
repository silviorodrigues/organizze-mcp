import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { organizzeService } from "./services/organizze.service.js";

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
            text: `Failed to query events: ${error.message}`,
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