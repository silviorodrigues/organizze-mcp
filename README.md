# Organizze MCP

An MCP (Model Context Protocol) server for the Organizze API.

## Installation

To use this MCP server with Claude, you need to provide your Organizze credentials:

```json
{
  "mcpServers": {
    "organizze-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "organizze-mcp",
        "--organizze-username=YOUR_USERNAME",
        "--organizze-api-key=YOUR_API_KEY"
      ]
    }
  }
}
```

`username` is the email address you use to log in to Organizze, and the `api-key` can be found in your [Organizze account settings](https://app.organizze.com.br/configuracoes/api-keys).

## Available Tools

The MCP server provides the following tools:

- `get-bank-accounts`: Get a list of bank accounts
- `get-credit-cards`: Get a list of credit cards or a single credit card by ID
- `get-budgets`: Get a list of target budgets
- `get-categories`: Get a list of categories or a single category by ID

## Example

Once connected to the MCP server, you can use the tools in Claude:

```
I want to see my bank accounts.
```

Claude will use the `get-bank-accounts` tool to fetch and display your bank accounts from Organizze.

You can also specify parameters:

```
Show me the details of category with ID 123.
```

Claude will use the `get-categories` tool with the specified category ID.

## License

MIT