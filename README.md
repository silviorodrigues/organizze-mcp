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

### Account and Transaction Tools

- `get-bank-accounts`: Get a list of bank accounts or a single bank account by ID
- `get-transactions`: Get a list of transactions
- `get-transaction`: Get details about a specific transaction

### Credit Card Tools

- `get-credit-cards`: Get a list of credit cards or a single credit card by ID
- `get-credit-cards-invoices`: Get a list of credit card invoices by credit card ID
- `get-credit-cards-invoice-details`: Get details about a credit card invoice

### Budget and Category Tools

- `get-budgets`: Get a list of target budgets
- `get-categories`: Get a list of categories or a single category by ID

## Examples

Once connected to the MCP server, you can use the tools in Claude:

### Basic Usage

```
I want to see my bank accounts.
```

Claude will use the `get-bank-accounts` tool to fetch and display your bank accounts from Organizze.

### Using Parameters

```
Show me the details of category with ID 123.
```

Claude will use the `get-categories` tool with the specified category ID.

### Complex Queries

```
Show me all transactions from my checking account between January 1st and January 31st, 2023.
```

Claude will use the `get-transactions` tool with account_id and date_range parameters.

```
I need to see the details of my credit card invoice #456 for my Visa card.
```

Claude will use the `get-credit-cards-invoice-details` tool with the appropriate credit_card_id and invoice_id.

### Budget Analysis

```
What were my budget targets for December 2023?
```

Claude will use the `get-budgets` tool with year and month parameters to retrieve the requested budget information.

## License

MIT